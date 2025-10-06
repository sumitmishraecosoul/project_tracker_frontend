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
      await updateTaskStatus(currentBrand?.id || 'test-brand-id', taskId, newStatus as any);
    } catch (error) {
      console.error('Error updating task status:', error);
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
      [field]: value
    }));
  };


  console.log('ModernProjectDetail: Loading state check', { 
    loading, 
    brandLoading, 
    currentBrand: !!currentBrand,
    currentBrandId: currentBrand?.id 
  });

  // Loading state
  if (loading || brandLoading) {
    return (
      <VerticalLayout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">
            {brandLoading ? 'Loading brand...' : 'Loading project...'}
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
            <button className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 flex items-center space-x-1">
              <i className="ri-add-line text-sm"></i>
              <span>Create</span>
            </button>
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
              SM
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Task Management Area */}
          <div className="flex-1 flex flex-col">
            {/* Project Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      SM
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
            </div>

            {/* View Tabs */}
            <div className="bg-white border-b border-gray-200 px-6">
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
            </div>

            {/* Task Actions */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
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
            </div>

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
                    onTaskStatusChange={handleTaskStatusChange}
                    onTaskCheckboxClick={handleTaskCheckboxClick}
                    expandedTasks={expandedTasks}
                    toggleTaskExpansion={toggleTaskExpansion}
                      taskSubtasks={subtasks as any}
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
                  currentBrand={currentBrand}
                  projectId={projectId}
                />
        </div>
      </div>
      </CategoryProvider>
    </VerticalLayout>
  );
}
