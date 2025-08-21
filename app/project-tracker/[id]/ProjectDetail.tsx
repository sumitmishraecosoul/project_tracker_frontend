'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import AddUserTaskModal from '../../../components/AddUserTaskModal';
import EditTaskModal from '../../../components/EditTaskModal';
import { apiService } from '../../../lib/api-service';

interface Project {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  department?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  startDate: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Task {
  _id: string;
  id: string;
  projectId: string;
  task: string;
  description?: string;
  taskType?: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: string;
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  };
  startDate?: string;
  eta: string;
  estimatedHours?: number;
  actualHours?: number;
  remark?: string;
  roadBlock?: string;
  supportNeeded?: string;
  labels?: string[];
  attachments?: string[];
  relatedTasks?: string[];
  parentTask?: string;
  sprint?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  console.log('ProjectDetail component rendered with projectId:', projectId);

  useEffect(() => {
    console.log('ProjectDetail useEffect triggered with projectId:', projectId);
    
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    console.log('Authentication check - Token exists:', !!token);
    console.log('Authentication check - User exists:', !!user);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('Current user data:', userData);
        console.log('User role:', userData.role);
        console.log('User ID:', userData._id);
        console.log('User department:', userData.department);
        setCurrentUser(userData); // Set the current user state
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }
    
    if (projectId) {
      fetchProjectData();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching project data for ID:', projectId);
      console.log('Project ID type:', typeof projectId);
      console.log('Project ID length:', projectId.length);
      
      // Validate project ID
      if (!projectId || projectId.trim() === '') {
        throw new Error('Invalid project ID');
      }
      
      // Get project details - API returns { project: {...}, tasks: [...] }
      const response = await apiService.getProjectById(projectId);
      console.log('Project API response:', response);
      
      // Handle the expected API response format
      if (response && response.project) {
        // API returns { project: {...}, tasks: [...] }
        setProject(response.project);
        setTasks(response.tasks || []);
        console.log('Project set successfully:', response.project);
        console.log('Tasks set successfully:', response.tasks);
        console.log('Number of tasks:', response.tasks ? response.tasks.length : 0);
      } else if (response && response._id) {
        // Fallback: if response is the project directly (legacy format)
        setProject(response);
        console.log('Project set directly (legacy format):', response);
        
        // Try to get tasks separately
        try {
          const tasksResponse = await apiService.getProjectTasks(projectId);
          setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);
          console.log('Tasks fetched separately:', tasksResponse);
        } catch (tasksError) {
          console.log('Could not fetch tasks separately:', tasksError);
          setTasks([]);
        }
      } else {
        throw new Error('Invalid project response format');
      }
      
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError('Project not found or failed to load project data');
    }
    setLoading(false);
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task clicked:', task);
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: any) => {
    const saveTask = async () => {
      try {
        console.log('Saving updated task:', updatedTask);
        
        // Prepare the data for the API - only send the fields that the backend expects
        const taskDataForAPI = {
          task: updatedTask.task,
          description: updatedTask.description,
          taskType: updatedTask.taskType,
          status: updatedTask.status,
          priority: updatedTask.priority,
          assignedTo: updatedTask.assignedTo._id, // Send user ID, not the full object
          reporter: updatedTask.reporter._id, // Send user ID, not the full object
          startDate: updatedTask.startDate,
          eta: updatedTask.eta,
          estimatedHours: updatedTask.estimatedHours,
          actualHours: updatedTask.actualHours,
          remark: updatedTask.remark,
          roadBlock: updatedTask.roadBlock,
          supportNeeded: updatedTask.supportNeeded,
          labels: updatedTask.labels,
          attachments: updatedTask.attachments,
          relatedTasks: updatedTask.relatedTasks,
          parentTask: updatedTask.parentTask,
          sprint: updatedTask.sprint
        };
        
        console.log('Task data for API:', taskDataForAPI);
        await apiService.updateTask(updatedTask._id, taskDataForAPI);
        console.log('Task updated successfully');
        setIsEditModalOpen(false);
        setEditingTask(null);
        // Refresh the project data to update the task list
        await fetchProjectData();
      } catch (error) {
        console.error('Failed to update task:', error);
        setError('Failed to update task');
      }
    };
    
    saveTask();
  };

  // Helper functions for role-based permissions
  const canEditProject = (): boolean => {
    if (!currentUser || !project) return false;
    
    // Admin can edit any project
    if (currentUser.role === 'admin') return true;
    
    // Manager can edit projects from their department
    if (currentUser.role === 'manager') {
      return project.department === currentUser.department;
    }
    
    // Employees cannot edit any projects
    return false;
  };

  const canDeleteProject = (): boolean => {
    if (!currentUser || !project) return false;
    
    // Admin can delete any project
    if (currentUser.role === 'admin') return true;
    
    // Manager can delete projects from their department
    if (currentUser.role === 'manager') {
      return project.department === currentUser.department;
    }
    
    // Employees cannot delete any projects
    return false;
  };

  const canEditTask = (task: Task): boolean => {
    if (!currentUser) return false;
    
    // Admin can edit any task
    if (currentUser.role === 'admin') return true;
    
    // Manager can edit tasks from their department
    if (currentUser.role === 'manager') {
      // Manager can edit any task - backend will handle department restrictions
      return true;
    }
    
    // Employees can edit tasks assigned to them or created by them
    if (currentUser.role === 'employee') {
      return task.assignedTo._id === currentUser._id || 
             task.reporter._id === currentUser._id;
    }
    
    return false;
  };

  const canDeleteTask = (task: Task): boolean => {
    if (!currentUser) return false;
    
    // Admin can delete any task
    if (currentUser.role === 'admin') return true;
    
    // Manager can delete tasks from their department
    if (currentUser.role === 'manager') {
      // Manager can delete any task - backend will handle department restrictions
      return true;
    }
    
    // Employees CANNOT delete any tasks
    if (currentUser.role === 'employee') {
      return false;
    }
    
    return false;
  };

  const canCreateTask = (): boolean => {
    if (!currentUser) return false;
    
    // ALL users can create tasks now (admin, manager, employee)
    // Backend will handle the specific restrictions for each role
    return true;
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) {
      console.error('No task ID provided for deletion');
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      try {
        console.log('Deleting task with ID:', taskId);
        await apiService.deleteTask(taskId);
        console.log('Task deleted successfully');
        // Refresh the project data to update the task list
        await fetchProjectData();
      } catch (error) {
        console.error('Failed to delete task:', error);
        setError('Failed to delete task');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-gray-600">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering project detail with project:', project);
  console.log('Rendering project detail with tasks:', tasks);
  console.log('Tasks length:', tasks.length);
  console.log('Current user state:', currentUser);
  console.log('Can create task:', canCreateTask());
  
  // Debug: Check each task's permissions
  tasks.forEach((task, index) => {
    console.log(`Task ${index}:`, {
      taskId: task._id,
      taskName: task.task,
      assignedTo: task.assignedTo,
      reporter: task.reporter,
      canEdit: canEditTask(task),
      canDelete: canDeleteTask(task)
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/project-tracker" className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
            {currentUser && (
              <p className="text-sm text-gray-500 mt-1">
                Role: {currentUser.role} • Department: {currentUser.department}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Priority</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    project.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : project.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {project.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Start Date</p>
                  <p className="mt-1 text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="mt-1 text-gray-900">{new Date(project.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
                {canCreateTask() && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center"
                  >
                    <i className="ri-add-line w-4 h-4 mr-2"></i>
                    Add New Task
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sprint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.task}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{task.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           task.taskType === 'Daily'
                             ? 'bg-blue-100 text-blue-800'
                             : task.taskType === 'Weekly'
                             ? 'bg-purple-100 text-purple-800'
                             : task.taskType === 'Monthly'
                             ? 'bg-green-100 text-green-800'
                             : 'bg-gray-100 text-gray-800'
                         }`}>
                          {task.taskType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                           task.status === 'Completed' 
                             ? 'bg-green-100 text-green-800'
                             : task.status === 'In Progress'
                             ? 'bg-yellow-100 text-yellow-800'
                             : task.status === 'Blocked'
                             ? 'bg-red-100 text-red-800'
                             : task.status === 'On Hold'
                             ? 'bg-orange-100 text-orange-800'
                             : task.status === 'Cancelled'
                             ? 'bg-gray-200 text-gray-800'
                             : 'bg-gray-100 text-gray-800'
                         }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.reporter?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.eta).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.actualHours || 0}/{task.estimatedHours || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.sprint || 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {canEditTask(task) && (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                              title="Edit Task"
                            >
                              <i className="ri-edit-line w-3 h-3 mr-1"></i>
                              Edit
                            </button>
                          )}
                          {canDeleteTask(task) && (
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm"
                              title="Delete Task"
                            >
                              <i className="ri-delete-bin-line w-3 h-3 mr-1"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                        No tasks found for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <AddUserTaskModal
          projectId={projectId}
          onAdd={(task) => {
            console.log('New task added:', task);
            setIsAddModalOpen(false);
            fetchProjectData();
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isEditModalOpen && editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}