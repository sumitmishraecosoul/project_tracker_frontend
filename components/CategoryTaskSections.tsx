'use client';

import React, { useState } from 'react';
import { useCategories } from './CategoryContext';
import { useTasks } from './TaskContext';
import { useBrand } from './BrandContext';

interface CategoryTaskSectionsProps {
  onTaskSelect: (task: any) => void;
  selectedTask: any;
  onAddTask: (categoryId: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onTaskCheckboxClick: (task: any) => void;
  expandedTasks: { [key: string]: boolean };
  toggleTaskExpansion: (taskId: string) => void;
  taskSubtasks: { [key: string]: any[] };
  getAssigneeAvatar: (task: any) => React.ReactNode;
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
  getAssigneeAvatar
}: CategoryTaskSectionsProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { tasks, loading: tasksLoading } = useTasks();
  const { currentBrand } = useBrand();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (categoryName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getTasksForCategory = (categoryId: string) => {
    if (!tasks || !currentBrand) return [];
    
    const filteredTasks = tasks.filter(task => 
      task.category_id === categoryId && 
      task.brand_id === currentBrand.id
    );
    
    console.log('CategoryTaskSections: getTasksForCategory', {
      categoryId: categoryId,
      totalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      currentBrandId: currentBrand.id,
      allTasks: tasks.map(t => ({ id: t._id, category_id: t.category_id, brand_id: t.brand_id, task: t.task }))
    });
    
    // Also log individual task details
    tasks.forEach((task, index) => {
      console.log(`Task ${index}:`, {
        id: task._id,
        task: task.task,
        category_id: task.category_id,
        brand_id: task.brand_id,
        matchesCategory: task.category_id === categoryId,
        matchesBrand: task.brand_id === currentBrand.id
      });
    });
    
    return filteredTasks;
  };

  if (categoriesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white p-6 text-center">
        <p className="text-gray-600 mb-4">No categories found. This project doesn't have any categories yet.</p>
        <p className="text-sm text-gray-500 mb-4">
          Categories should be automatically created when a project is created.
          If you're seeing this message, the default categories may not have been created.
        </p>
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
                {categoryTasks.length === 0 ? (
                  <div 
                    onClick={() => onAddTask(category._id)}
                    className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Add task...
                  </div>
                ) : (
                  categoryTasks.map((task) => (
                    <div key={task._id}>
                      {/* Main Task */}
                      <div 
                        className={`px-6 py-3 hover:bg-gray-50 cursor-pointer ${selectedTask?._id === task._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        onClick={() => onTaskSelect(task)}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
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
                          <div className="col-span-4 flex items-center space-x-3">
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
                              <span className="text-sm text-gray-900">{task.task}</span>
                            {taskSubtasks[task._id] && taskSubtasks[task._id].length > 0 && (
                              <span className="text-xs text-gray-500">({taskSubtasks[task._id].length})</span>
                            )}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              {getAssigneeAvatar(task)}
                              <span className="text-sm text-gray-900">{task.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">
                              {task.eta ? new Date(task.eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-purple-100 text-purple-800' : task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <select 
                              value={task.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                onTaskStatusChange(task._id, e.target.value);
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 bg-transparent ${task.status === 'Yet to Start' ? 'bg-gray-100 text-gray-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              <option value="Yet to Start">Yet to Start</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Blocked">Blocked</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600"
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
                              <div className="grid grid-cols-12 gap-4 items-center">
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
                  ))
                )}
                
                {/* Add task button for each category */}
                <div 
                  onClick={() => onAddTask(category._id)}
                  className="px-6 py-3 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Add task...
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
