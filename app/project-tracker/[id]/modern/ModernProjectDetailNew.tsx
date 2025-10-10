'use client';

import { useState, useEffect, useMemo } from 'react';
import VerticalLayout from '../../../../components/VerticalLayout';
import { apiService } from '../../../../lib/api-service';
import { Project, Task, CreateTaskData } from '../../../../lib/types';
import { useTasks } from '../../../../components/TaskContext';
import { useProjects } from '../../../../components/ProjectContext';
import { useBrand } from '../../../../components/BrandContext';
import { useSubtasks } from '../../../../components/SubtaskContext';
import { useSidebar } from '../../../../components/SidebarContext';
import { CategoryProvider } from '../../../../components/CategoryContext';
import CategoryTaskSections from '../../../../components/CategoryTaskSections';
import TaskDetailsPanel from '../../../../components/TaskDetailsPanel';

interface ModernProjectDetailProps {
  projectId: string;
  selectedBrand?: { id: string; name: string } | null;
}

export default function ModernProjectDetail({ projectId, selectedBrand = null }: ModernProjectDetailProps) {
  // Context hooks
  const { tasks, loading: tasksLoading, getProjectTasks, createTask, updateTask, updateTaskStatus } = useTasks();
  const { projects, getProjectDetails, currentProject } = useProjects();
  const { currentBrand, isLoading: brandLoading } = useBrand();
  const { subtasks, getTaskSubtasks, createSubtask, updateSubtaskStatus: updateSubtaskStatusContext } = useSubtasks();
  
  // Organize subtasks by task ID for display
  const taskSubtasks = useMemo(() => {
    // Organize subtasks by task ID for display
    
    const organized: { [key: string]: any[] } = {};
    if (Array.isArray(subtasks)) {
      subtasks.forEach((subtask) => {
        // Extract task ID - backend uses 'task_id' field
        let taskId: string | undefined;
        if (typeof subtask.parentTaskId === 'string') {
          taskId = subtask.parentTaskId;
        } else if (subtask.parentTaskId && typeof subtask.parentTaskId === 'object') {
          taskId = subtask.parentTaskId._id;
        } else if ((subtask as any).task_id) {
          taskId = (subtask as any).task_id;
        } else if ((subtask as any).taskId) {
          taskId = (subtask as any).taskId;
        }
        
        if (taskId) {
          if (!organized[taskId]) {
            organized[taskId] = [];
          }
          organized[taskId].push(subtask);
        }
      });
    }
    // Return organized subtasks
    return organized;
  }, [subtasks]);
  const { closeBothSidebars } = useSidebar();
  // Remove old category context usage
  
  // Local state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Task management state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<{ [taskId: string]: boolean }>({});
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedCategoryForTask, setSelectedCategoryForTask] = useState<string>('');
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Category state removed - now handled by CategoryProvider
  
  // User management
  const [users, setUsers] = useState<any[]>([]);

  // Memoize CategoryProvider props to prevent unnecessary re-renders
  const categoryProviderProps = useMemo(() => ({
    brandId: currentBrand?.id || 'test-brand-id', // Use test ID for now
    projectId: projectId || 'test-project-id' // Use test ID for now
  }), [currentBrand?.id, projectId]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(''); // Clear any previous errors
        
        console.log('ModernProjectDetail: Loading data with', { 
          projectId, 
          currentBrandId: currentBrand?.id, 
          hasCurrentBrand: !!currentBrand,
          currentBrandName: currentBrand?.name
        });
        
        // Load project details
        if (projectId && currentBrand) {
          try {
            const projectData = await getProjectDetails(currentBrand.id, projectId);
            setProject(projectData);
          } catch (projectError) {
            console.error('Error loading project:', projectError);
            // Don't fail the entire page if project details fail
            // Just log the error and continue
          }
        }

        // Load project tasks
        if (projectId && currentBrand) {
          try {
            await getProjectTasks(currentBrand.id, projectId);
            console.log('Loaded project tasks');
          } catch (taskError) {
            console.error('Error loading project tasks:', taskError);
            // Don't fail the entire page if tasks fail
          }
        }

        // Categories are now loaded by CategoryProvider
      } catch (error) {
        console.error('Error loading data:', error);
        // Don't set error state - let the page load anyway
        // setError('Failed to load project data');
      } finally {
        // Always set loading to false so the page can render
        setLoading(false);
        console.log('ModernProjectDetail: Loading complete');
      }
    };

    loadData();
  }, [projectId, currentBrand]);

  // Load subtasks for all tasks when tasks change
  useEffect(() => {
    const loadAllSubtasks = async () => {
      if (!tasks || tasks.length === 0 || !currentBrand?.id) {
        console.log('🟢 No tasks to load subtasks for');
        return;
      }
      
      console.log('🟢 Loading subtasks for all tasks, count:', tasks.length);
      
      // Load subtasks for each task
      for (const task of tasks) {
        try {
          console.log('🟢 Loading subtasks for task:', task._id);
          await getTaskSubtasks(task._id);
        } catch (error) {
          console.error('🟢 Error loading subtasks for task:', task._id, error);
        }
      }
      
      console.log('🟢 Finished loading all subtasks');
    };
    
    loadAllSubtasks();
  }, [tasks, currentBrand?.id]);

  // Listen for task update events to force refresh
  useEffect(() => {
    const handleTaskUpdate = async (event: any) => {
      console.log('ModernProjectDetail: Received task update event', event.detail);
      if (currentBrand && projectId) {
        console.log('ModernProjectDetail: Refreshing tasks due to update event');
        await getProjectTasks(currentBrand.id, projectId);
        setForceRefresh(prev => prev + 1);
      }
    };

    window.addEventListener('taskUpdated', handleTaskUpdate);
    return () => window.removeEventListener('taskUpdated', handleTaskUpdate);
  }, [currentBrand, projectId, getProjectTasks]);

  // Helper functions

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
    // Automatically collapse both sidebars when task details open
    closeBothSidebars();
  };

  const handleAddTask = async (categoryId: string, taskData?: any) => {
    if (taskData) {
      // Handle inline task creation from CategoryTaskSections
      try {
        setIsCreatingTask(true);
        await createTask(currentBrand?.id || 'test-brand-id', taskData);
        console.log('Task created successfully in category:', categoryId);
      } catch (error) {
        console.error('Error creating task:', error);
      } finally {
        setIsCreatingTask(false);
      }
    } else {
      // Legacy behavior (should not be used anymore)
      setSelectedCategoryForTask(categoryId);
      setShowNewTaskInput(true);
      setNewTaskName('');
    }
  };

  const handleAddSubtask = async (taskId: string, subtaskData?: any) => {
    console.log('🟢🟢🟢 handleAddSubtask called:', { taskId, subtaskData });
    
    if (subtaskData) {
      // Handle inline subtask creation
      try {
        console.log('🟢 handleAddSubtask: Creating subtask with data:', subtaskData);
        setIsCreatingTask(true);
        await createSubtask({
          ...subtaskData,
          parentTaskId: taskId
        });
        console.log('🟢 handleAddSubtask: Subtask created successfully for task:', taskId);
        
        // Refresh subtasks for this task to show the newly created subtask
        if (currentBrand?.id) {
          console.log('🟢 handleAddSubtask: Refreshing subtasks for task:', taskId);
          const fetchedSubtasks = await getTaskSubtasks(taskId);
          console.log('🟢 handleAddSubtask: Subtasks fetched:', fetchedSubtasks);
          console.log('🟢 handleAddSubtask: Subtasks count:', fetchedSubtasks?.length);
          console.log('🟢 handleAddSubtask: Subtasks refreshed successfully');
          
          // Auto-expand the task to show the new subtask
          setExpandedTasks(prev => ({
            ...prev,
            [taskId]: true
          }));
          console.log('🟢 handleAddSubtask: Task expanded to show subtasks');
        }
      } catch (error) {
        console.error('handleAddSubtask: Error creating subtask:', error);
      } finally {
        setIsCreatingTask(false);
      }
    } else {
      // Handle opening the add subtask modal or inline form
      console.log('Add subtask clicked for task:', taskId);
      // The inline form is now handled in CategoryTaskSections component
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || isCreatingTask || !selectedCategoryForTask || !currentBrand) return;

    try {
      setIsCreatingTask(true);
      
      // Get current user ID for assignedTo and reporter
      const currentUser = localStorage.getItem('currentUser');
      const userData = currentUser ? JSON.parse(currentUser) : null;
      const userId = userData?.id || currentBrand?.id || '';
      
          const taskData = {
            task: newTaskName.trim(),
            description: '',
            projectId: projectId,
            assignedTo: userId,
            reporter: userId,
            eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            status: 'Yet to Start' as const,
            priority: 'Medium' as const,
            category_id: selectedCategoryForTask
          };

      await createTask(currentBrand?.id || 'test-brand-id', taskData);
      setNewTaskName('');
      setShowNewTaskInput(false);
      setSelectedCategoryForTask('');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      console.log('ModernProjectDetail - handleTaskStatusChange called:', { taskId, newStatus, brandId: currentBrand?.id });
      
      if (!currentBrand?.id) {
        console.error('ModernProjectDetail - No brand ID available for status update');
        return;
      }
      
      await updateTaskStatus(currentBrand.id, taskId, newStatus as any);
      console.log('ModernProjectDetail - Task status updated successfully');
      
      // Refresh the task list to show the updated status
      if (projectId) {
        await getProjectTasks(currentBrand.id, projectId);
        console.log('ModernProjectDetail - Task list refreshed after status update');
      }
    } catch (error) {
      console.error('ModernProjectDetail - Error updating task status:', error);
      // Show error to user
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleTaskCheckboxClick = async (task: any) => {
    const newStatus = task.status === 'Completed' ? 'Yet to Start' : 'Completed';
    await handleTaskStatusChange(task._id, newStatus);
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getAssigneeAvatar = (task: any) => {
    if (task.assignedTo?.avatar) {
      return (
        <img 
          src={task.assignedTo.avatar} 
          alt={task.assignedTo.name} 
          className="w-6 h-6 rounded-full"
        />
      );
    }
    return (
      <div className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center">
        <i className="ri-user-line text-xs text-gray-400"></i>
      </div>
    );
  };

  const handleSubtaskCheckboxClick = async (taskId: string, subtaskId: string) => {
    try {
      await updateSubtaskStatusContext(taskId, subtaskId);
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  const handleCreateSubtask = async (taskId: string) => {
    if (!newSubtaskName.trim()) return;
    
    try {
      await createSubtask({ task: newSubtaskName.trim() });
      setNewSubtaskName('');
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };



  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    
    try {
      console.log('handleUpdateTask: Refreshing task list after update');
      
      // Force refresh the task list to show updates in category sections
      if (currentBrand) {
        console.log('handleUpdateTask: Refreshing project tasks for brand:', currentBrand.id, 'project:', projectId);
        
        // Force a complete refresh of the task list
        await getProjectTasks(currentBrand.id, projectId);
        
        // Force a state update to trigger re-render
        setSelectedTask({ ...selectedTask, _lastUpdated: Date.now() });
        
        // Also force a refresh of the selected task data
        setTimeout(async () => {
          console.log('handleUpdateTask: Refreshing selected task data');
          // Get the latest task data from the refreshed task list
          await getProjectTasks(currentBrand.id, projectId);
          // The tasks will be updated in the context, so we can access them from there
          // For now, just force a re-render with the current selectedTask
          setSelectedTask((prev: any) => ({ ...prev, _lastUpdated: Date.now() }));
        }, 600);
        
        // Also force a small delay to ensure the update is processed
        setTimeout(async () => {
          console.log('handleUpdateTask: Forcing additional refresh');
          await getProjectTasks(currentBrand.id, projectId);
          setForceRefresh(prev => prev + 1);
        }, 500);
        
        // One more refresh after a longer delay to ensure backend has processed
        setTimeout(async () => {
          console.log('handleUpdateTask: Final refresh to ensure data is current');
          await getProjectTasks(currentBrand.id, projectId);
          setForceRefresh(prev => prev + 1);
        }, 1000);
        
        console.log('handleUpdateTask: Project tasks refreshed successfully');
      }
      
      // Don't close the task details panel automatically
      // setShowTaskDetails(false);
    } catch (error) {
      console.error('Error refreshing task list:', error);
    }
  };

  const handleTaskChange = (field: string, value: any) => {
    console.log('handleTaskChange called:', { field, value, currentSelectedTask: selectedTask });
    setSelectedTask((prev: any) => ({
      ...prev,
      [field]: value,
      _lastUpdated: Date.now() // Force a new object reference
    }));
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      console.log('handleTaskDelete called:', { taskId, brandId: currentBrand?.id });
      
      if (!currentBrand?.id) {
        console.error('No brand ID available for task deletion');
        alert('No brand selected. Cannot delete task.');
        return;
      }

      // Call the API to delete the task
      const response = await apiService.deleteBrandTask(currentBrand.id, taskId);
      
      if (response.success) {
        console.log('Task deleted successfully');
        
        // Close the task details panel if the deleted task was selected
        if (selectedTask?._id === taskId) {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }
        
        // Refresh the task list
        if (projectId) {
          await getProjectTasks(currentBrand.id, projectId);
          console.log('Task list refreshed after deletion');
        }
        
        // Show success message
        alert('Task deleted successfully!');
      } else {
        console.error('Failed to delete task:', response.message);
        alert(`Failed to delete task: ${response.message}`);
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      
      // Show user-friendly error message
      if (error.message && error.message.includes('INSUFFICIENT_ROLE')) {
        alert('You don\'t have permission to delete tasks. Please contact your administrator.');
      } else if (error.message && error.message.includes('NOT_FOUND')) {
        alert('Task not found. It may have already been deleted.');
      } else {
        alert('Failed to delete task. Please try again or contact support.');
      }
    }
  };


  console.log('ModernProjectDetail: Loading state check', { 
    loading, 
    brandLoading, 
    currentBrand: !!currentBrand,
    currentBrandId: currentBrand?.id 
  });

  // Loading state with timeout
  if (loading || brandLoading) {
    return (
      <VerticalLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">
            {brandLoading ? 'Loading brand...' : 'Loading project...'}
          </p>
          <p className="ml-3 text-sm text-gray-500">
            If this takes too long, please check your connection or refresh the page.
          </p>
        </div>
      </VerticalLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <VerticalLayout>
        <div className="h-screen flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </VerticalLayout>
    );
  }

  // No brand selected - temporarily allow rendering for testing
  if (!currentBrand) {
    console.log('ModernProjectDetail: No currentBrand, but allowing render for testing');
    // return (
    //   <VerticalLayout>
    //     <div className="h-screen flex items-center justify-center">
    //       <div className="text-center">
    //         <p className="text-gray-600 mb-4">No brand selected</p>
    //         <p className="text-sm text-gray-500">Please select a brand to view this project.</p>
    //       </div>
    //     </div>
    //   </VerticalLayout>
    // );
  }

  console.log('ModernProjectDetail: About to render CategoryProvider with', {
    brandId: currentBrand?.id,
    projectId,
    currentBrandName: currentBrand?.name
  });

  return (
    <VerticalLayout>
      <CategoryProvider {...categoryProviderProps}>
        <div className="h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-menu-line text-lg"></i>
            </button>
            {/* <button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 flex items-center space-x-1">
              <i className="ri-add-line text-sm"></i>
              <span>Create</span>
            </button> */}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Q Search"
                className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-question-line text-lg"></i>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <i className="ri-flashlight-line text-lg"></i>
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {(() => {
                const currentUserData = localStorage.getItem('currentUser');
                const userData = currentUserData ? JSON.parse(currentUserData) : null;
                const userName = userData?.name || 'User';
                return userName.charAt(0)?.toUpperCase();
              })()}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Task Management Area */}
          <div className="flex-1 flex flex-col">
            {/* Project Header */}
            {/* <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(() => {
                        const currentUserData = localStorage.getItem('currentUser');
                        const userData = currentUserData ? JSON.parse(currentUserData) : null;
                        const userName = userData?.name || 'User';
                        return userName.charAt(0)?.toUpperCase();
                      })()}
                    </div>
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-xs text-gray-600"></i>
                    </div>
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-xs text-gray-600"></i>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <i className="ri-more-2-line text-sm"></i>
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                      Share
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                      Customize
                    </button>
                    <select className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded">
                      <option>Set status</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {project ? (project as any).name || (project as any).title : `Project ${projectId}`}
                </div>
              </div>
            </div> */}

            {/* View Tabs */}
            {/* <div className="bg-white border-b border-gray-200 px-6">
              <div className="flex space-x-6">
                <button className="py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  List
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Board
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Timeline
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Dashboard
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Calendar
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Workflow
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Messages
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Files
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800">
                  Gantt
                </button>
                <button className="py-3 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                  <span>Categories</span>
                  <i className="ri-add-line text-xs"></i>
                </button>
              </div>
            </div> */}

            {/* Task Actions */}
            {/* <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center space-x-2">
                    <i className="ri-filter-line text-sm"></i>
                    <span>Filter</span>
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center space-x-2">
                    <i className="ri-sort-desc text-sm"></i>
                    <span>Sort</span>
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center space-x-2">
                    <i className="ri-layout-grid-line text-sm"></i>
                    <span>Group</span>
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded flex items-center space-x-2">
                    <i className="ri-settings-3-line text-sm"></i>
                    <span>Options</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <i className="ri-search-line text-sm"></i>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <i className="ri-question-line text-sm"></i>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <i className="ri-user-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div> */}

            {/* Task Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="grid grid-cols-12 gap-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">Check</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Assign to</div>
                <div className="col-span-2">Start Date</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2 text-center">Status</div>
              </div>
            </div>




                  {/* Category Task Sections */}
                  <CategoryTaskSections
                    key={`${currentBrand?.id || 'test'}-${projectId || 'test'}-${tasks?.length || 0}-${forceRefresh}`}
                    onTaskSelect={handleTaskSelect}
                    selectedTask={selectedTask}
                    onAddTask={handleAddTask}
                    onAddSubtask={handleAddSubtask}
                    onTaskStatusChange={handleTaskStatusChange}
                    onTaskCheckboxClick={handleTaskCheckboxClick}
                    onTaskDelete={handleTaskDelete}
                    expandedTasks={expandedTasks}
                    toggleTaskExpansion={toggleTaskExpansion}
                      taskSubtasks={taskSubtasks}
                    getAssigneeAvatar={getAssigneeAvatar}
                    projectId={projectId}
                  />
                  {false && (
              <div className="bg-white p-6 text-center">
                <p className="text-gray-600 mb-4">No brand selected. Please select a brand to view categories.</p>
                <p className="text-sm text-gray-500">Current Brand: {currentBrand?.id || 'None'}</p>
              </div>
            )}
          </div>

                {/* Task Details Panel */}
                <TaskDetailsPanel
                  key={`${selectedTask?._id}-${selectedTask?._lastUpdated || Date.now()}`}
                  showTaskDetails={showTaskDetails}
                  selectedTask={selectedTask}
                  users={users}
                  onClose={() => setShowTaskDetails(false)}
                  onUpdateTask={handleUpdateTask}
                  onTaskChange={handleTaskChange}
                  onTaskDelete={handleTaskDelete}
                  currentBrand={currentBrand}
                  projectId={projectId}
                />
        </div>
      </div>
      </CategoryProvider>
    </VerticalLayout>
  );
}
