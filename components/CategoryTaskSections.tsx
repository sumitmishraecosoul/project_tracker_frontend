'use client';

import React, { useState, useEffect } from 'react';
import { useCategories } from './CategoryContext';
import { useTasks } from './TaskContext';
import { useBrand } from './BrandContext';
import { apiService } from '../lib/api-service';

interface CategoryTaskSectionsProps {
  onTaskSelect: (task: any) => void;
  selectedTask: any;
  onAddTask: (categoryId: string, taskData?: any) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onTaskCheckboxClick: (task: any) => void;
  expandedTasks: { [key: string]: boolean };
  toggleTaskExpansion: (taskId: string) => void;
  taskSubtasks: { [key: string]: any[] };
  getAssigneeAvatar: (task: any) => React.ReactNode;
  projectId: string;
}

export default function CategoryTaskSections({
  onTaskSelect,
  selectedTask,
  onAddTask,
  onTaskStatusChange,
  onTaskCheckboxClick,
  expandedTasks,
  toggleTaskExpansion,
  taskSubtasks,
  getAssigneeAvatar,
  projectId
}: CategoryTaskSectionsProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { tasks, loading: tasksLoading } = useTasks();
  const { currentBrand } = useBrand();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Low');
  const [newTaskStatus, setNewTaskStatus] = useState('Yet to Start');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [brandUsers, setBrandUsers] = useState<any[]>([]);

  // Force refresh when tasks change
  useEffect(() => {
    console.log('CategoryTaskSections: Tasks changed, forcing refresh', {
      tasksLength: tasks?.length || 0,
      tasksLoading,
      categoriesLength: categories?.length || 0
    });
    setRefreshKey(prev => prev + 1);
  }, [tasks, tasksLoading]);

  // Also refresh when categories change
  useEffect(() => {
    console.log('CategoryTaskSections: Categories changed, forcing refresh');
    setRefreshKey(prev => prev + 1);
  }, [categories]);

  // Listen for taskUpdated events
  useEffect(() => {
    const handleTaskUpdated = (event: any) => {
      console.log('CategoryTaskSections: Received taskUpdated event', event.detail);
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('taskUpdated', handleTaskUpdated);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdated);
  }, []);

  const toggleSection = (categoryName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getTasksForCategory = (categoryId: string) => {
    if (!tasks || !currentBrand) {
      console.log('CategoryTaskSections: No tasks or currentBrand', { tasks: !!tasks, currentBrand: !!currentBrand });
      return [];
    }
    
    console.log('CategoryTaskSections: getTasksForCategory called with', {
      categoryId,
      totalTasks: tasks.length,
      currentBrandId: currentBrand.id,
      tasksLoading,
      categoriesLoading
    });
    
    const filteredTasks = tasks.filter(task => 
      task.category_id === categoryId && 
      task.brand_id === currentBrand.id
    );
    
    console.log('CategoryTaskSections: Filtered tasks result', {
      categoryId,
      filteredCount: filteredTasks.length,
      allTasks: tasks.map(t => ({ 
        id: t._id, 
        task: t.task, 
        category_id: t.category_id, 
        brand_id: t.brand_id,
        status: t.status,
        priority: t.priority
      }))
    });
    
    return filteredTasks;
  };

  const loadBrandUsers = async () => {
    const brandId = currentBrand?.id;
    if (!brandId) {
      console.log('No current brand, trying to load users anyway for testing');
      // Try to load users even without brand for testing
      try {
        const response = await apiService.getBrandUsers('test-brand-id');
        let users = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response && Array.isArray(response.data)) {
          users = response.data;
        } else if (response && response.users) {
          users = response.users;
        }
        console.log('Test brand users loaded:', users);
        setBrandUsers(users);
      } catch (error) {
        console.error('Error loading test brand users:', error);
        setBrandUsers([]);
      }
      return;
    }
    
    try {
      console.log('Loading brand users for brand:', brandId);
      const response = await apiService.getBrandUsers(brandId);
      
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && response.users) {
        users = response.users;
      }
      
      console.log('Brand users loaded:', users);
      setBrandUsers(users);
    } catch (error) {
      console.error('Error loading brand users:', error);
      setBrandUsers([]);
    }
  };

  const handleStartAddingTask = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setNewTaskName('');
    setNewTaskAssignee('');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setNewTaskPriority('Low');
    setNewTaskStatus('Yet to Start');
    loadBrandUsers();
  };

  const handleCancelAddingTask = () => {
    setEditingCategoryId(null);
    setNewTaskName('');
    setNewTaskAssignee('');
    setNewTaskStartDate('');
    setNewTaskDueDate('');
    setNewTaskPriority('Low');
    setNewTaskStatus('Yet to Start');
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !editingCategoryId || !currentBrand) return;
    
    try {
      setIsCreatingTask(true);
      
      // Get current user ID for reporter (who created the task)
      const currentUser = localStorage.getItem('currentUser');
      const userData = currentUser ? JSON.parse(currentUser) : null;
      const userId = userData?.id || currentBrand?.id || '';
      
      const taskData = {
        task: newTaskName.trim(),
        projectId: projectId,
        category_id: editingCategoryId,
        assignedTo: newTaskAssignee || currentBrand.id,
        reporter: userId, // Use actual current user ID instead of brand ID
        eta: newTaskDueDate || new Date().toISOString(),
        startDate: newTaskStartDate || new Date().toISOString(),
        priority: newTaskPriority,
        status: newTaskStatus
      };
      
      // Call the parent's task creation function
      await onAddTask(editingCategoryId, taskData);
      
      // Reset the form
      setEditingCategoryId(null);
      setNewTaskName('');
      setNewTaskAssignee('');
      setNewTaskStartDate('');
      setNewTaskDueDate('');
      setNewTaskPriority('Low');
      setNewTaskStatus('Yet to Start');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreatingTask) {
      handleCreateTask();
    } else if (e.key === 'Escape') {
      handleCancelAddingTask();
    }
  };

  console.log('CategoryTaskSections: Rendering with', {
    categoriesLoading,
    tasksLoading,
    categories: categories?.length || 0,
    tasks: tasks?.length || 0,
    currentBrand: currentBrand?.id,
    sampleTask: tasks?.[0] ? {
      id: tasks[0]._id,
      name: tasks[0].task,
      startDate: tasks[0].startDate,
      eta: tasks[0].eta,
      assignedTo: tasks[0].assignedTo
    } : null
  });

  if (categoriesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white p-6">
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">No categories found. This project doesn't have any categories yet.</p>
          <p className="text-sm text-gray-500 mb-4">
            Categories should be automatically created when a project is created.
            If you're seeing this message, the default categories may not have been created.
          </p>
        </div>
        
        {/* Show test data to demonstrate spacing */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Test Layout (Spacing Demo)</h3>
          
          {/* Header */}
          <div className="grid grid-cols-12 gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            <div className="col-span-1">Check</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Assign to</div>
            <div className="col-span-2">Start Date</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          
          {/* Test Task Row */}
          <div className="grid grid-cols-12 gap-1 items-center py-2 border-b border-gray-200">
            <div className="col-span-1">
              <button className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
              </button>
            </div>
            <div className="col-span-2 flex items-center space-x-0.5">
              <span className="text-sm text-gray-900 truncate">Test Task Name</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-xs text-gray-400"></i>
                </div>
                <span className="text-sm text-gray-900 truncate">Test User</span>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-500">Oct 15</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-500">Oct 22</span>
            </div>
            <div className="col-span-1">
              <span className="px-0.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Low</span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <select className="px-1 py-1 rounded text-xs font-medium border-0 bg-transparent bg-gray-100 text-gray-800">
                <option value="Yet to Start">Yet to Start</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('CategoryTaskSections: Rendering with', {
    categoriesCount: categories.length,
    tasksCount: tasks.length,
    currentBrandId: currentBrand?.id,
    categories: categories.map(c => ({ id: c._id, name: c.name }))
  });
  
  console.log('All tasks:', tasks.map(t => ({
    id: t._id,
    task: t.task,
    category_id: t.category_id,
    brand_id: t.brand_id
  })));

  return (
    <div className="divide-y divide-gray-200">
      {categories.map((category) => {
        const categoryTasks = getTasksForCategory(category._id);
        const isExpanded = expandedSections[category.name] !== false; // Default to expanded
        
        console.log('CategoryTaskSections: Rendering category', {
          categoryName: category.name,
          categoryId: category._id,
          tasksCount: categoryTasks.length,
          isExpanded
        });
        
        if (categoryTasks.length > 0) {
          console.log(`Tasks for ${category.name}:`, categoryTasks.map(t => ({
            id: t._id,
            task: t.task,
            category_id: t.category_id
          })));
        }

        return (
          <div key={category._id} className="bg-white">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleSection(category.name)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <i className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line text-sm`}></i>
                </button>
                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                {category.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                )}
              </div>
              <span className="text-xs text-gray-500">{categoryTasks.length}</span>
            </div>
            
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {categoryTasks.map((task) => (
                  <div key={task._id}>
                    {/* Main Task */}
                    <div 
                      className={`px-6 py-3 hover:bg-gray-50 cursor-pointer ${selectedTask?._id === task._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => onTaskSelect(task)}
                    >
                      <div className="grid grid-cols-12 gap-1 items-center">
                        <div className="col-span-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskCheckboxClick(task);
                            }}
                            className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                          >
                            {task.status === 'Completed' ? (
                              <i className="ri-check-line text-xs text-green-600"></i>
                            ) : (
                              <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                            )}
                          </button>
                        </div>
                        <div className="col-span-2 flex items-center space-x-0.5">
                          {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task._id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <i className={`ri-arrow-${expandedTasks[task._id] ? 'down' : 'right'}-s-line text-sm`}></i>
                            </button>
                          )}
                          <span className="text-sm text-gray-900 truncate">{task.task}</span>
                          {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                            <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center space-x-1">
                            {getAssigneeAvatar(task)}
                            <span className="text-sm text-gray-900 truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-500">
                            {task.startDate ? new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                             task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                             'No date'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-500">
                            {task.eta ? new Date(task.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <span className={`px-0.5 py-0.5 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <select 
                            value={task.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              onTaskStatusChange(task._id, e.target.value);
                            }}
                            className={`px-1 py-1 rounded text-xs font-medium border-0 bg-transparent ${
                              task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : 
                              task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              task.status === 'Under Review' ? 'bg-amber-100 text-amber-800' : 
                              task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 
                              task.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' : 
                              task.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' : 
                              'bg-purple-100 text-purple-800'
                            }`}
                          >
                            <option value="Yet to Start">Yet to Start</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Completed">Completed</option>
                            <option value="Blocked">Blocked</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Recurring">Recurring</option>
                          </select>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskSelect(task);
                            }}
                          >
                            <i className="ri-arrow-right-s-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtasks */}
                    {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && expandedTasks[task._id] && (
                      <div className="bg-gray-50">
                        {taskSubtasks[task._id].map((subtask) => (
                          <div key={subtask._id} className="px-6 py-3 pl-14 border-b border-gray-100">
                            <div className="grid grid-cols-12 gap-1 items-center">
                              <div className="col-span-1">
                                <button 
                                  onClick={() => {
                                    // Handle subtask status change
                                    console.log('Subtask status change:', subtask._id);
                                  }}
                                  className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                                >
                                  {subtask.status === 'Completed' ? (
                                    <i className="ri-check-line text-xs text-green-600"></i>
                                  ) : (
                                    <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                                  )}
                                </button>
                              </div>
                              <div className="col-span-4">
                                <span className="text-sm text-gray-700">{subtask.title || subtask.task}</span>
                              </div>
                              <div className="col-span-2">
                                <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                  <i className="ri-user-line text-xs text-gray-400"></i>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
                                  <i className="ri-calendar-line text-xs text-gray-400"></i>
                                </div>
                              </div>
                              <div className="col-span-2"></div>
                              <div className="col-span-1"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add task button for each category */}
                {editingCategoryId === category._id ? (
                  <div className="px-6 py-3 bg-blue-50 border-l-4 border-blue-500">
                    <div className="grid grid-cols-12 gap-1 items-center">
                      <div className="col-span-1">
                        <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                          <i className="ri-checkbox-blank-line text-xs text-gray-400"></i>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder={isCreatingTask ? "Creating task..." : "Write a task name"}
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          disabled={isCreatingTask}
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={newTaskAssignee}
                          onChange={(e) => setNewTaskAssignee(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isCreatingTask}
                        >
                          <option value="">Unassigned</option>
                          {brandUsers.map(user => (
                            <option key={user._id || user.id} value={user._id || user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="date"
                          value={newTaskStartDate}
                          onChange={(e) => setNewTaskStartDate(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isCreatingTask}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isCreatingTask}
                        />
                      </div>
                      <div className="col-span-1">
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isCreatingTask}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <select
                          value={newTaskStatus}
                          onChange={(e) => setNewTaskStatus(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isCreatingTask}
                        >
                          <option value="Yet to Start">Yet to Start</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Completed">Completed</option>
                          <option value="Blocked">Blocked</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Recurring">Recurring</option>
                        </select>
                      </div>
                    </div>
                    {isCreatingTask && (
                      <div className="mt-2 text-xs text-blue-600 flex items-center">
                        <i className="ri-loader-4-line animate-spin mr-1"></i>
                        Creating task...
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => handleStartAddingTask(category._id)}
                    className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Add task...
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

