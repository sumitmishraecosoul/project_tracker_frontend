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
  taskType?: string;
  priority: string;
  status: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  reporter: {
    _id: string;
    name: string;
    email: string;
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

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching project data for ID:', projectId);
      
      // Get project details - this endpoint returns both project and tasks
      const response = await apiService.getProjectById(projectId);
      console.log('Project API response:', response);
      
      // Check if response has the expected structure
      if (response && response.project) {
        setProject(response.project);
        setTasks(response.tasks || []);
        console.log('Project data set:', response.project);
        console.log('Project _id:', response.project._id);
        console.log('Tasks data set:', response.tasks);
        console.log('Number of tasks:', response.tasks ? response.tasks.length : 0);
        
        // If no tasks in the response, try to fetch them separately
        if (!response.tasks || response.tasks.length === 0) {
          console.log('No tasks in response, trying to fetch separately...');
          try {
            const tasksResponse = await apiService.getProjectTasks(projectId);
            console.log('Separate tasks response:', tasksResponse);
            if (Array.isArray(tasksResponse) && tasksResponse.length > 0) {
              setTasks(tasksResponse);
              console.log('Tasks set from separate call:', tasksResponse);
            } else {
              // Last resort: fetch all tasks and filter
              console.log('Trying to fetch all tasks and filter...');
              const allTasks = await apiService.getTasks();
              console.log('All tasks in database:', allTasks);
              const projectTasks = allTasks.filter((task: any) => {
                console.log(`Checking task ${task.task}: projectId=${task.projectId}, projectId=${projectId}`);
                return task.projectId === projectId || task.projectId === response.project._id;
              });
              console.log('Filtered tasks for this project:', projectTasks);
              if (projectTasks.length > 0) {
                setTasks(projectTasks);
                console.log('Tasks set from filtered results:', projectTasks);
              }
            }
          } catch (separateError) {
            console.log('Separate tasks fetch failed:', separateError);
          }
        }
      } else if (response && response._id) {
        // Fallback: if response is the project directly
        setProject(response);
        console.log('Project set directly:', response);
        // Try to get tasks separately
        try {
          const tasksResponse = await apiService.getProjectTasks(projectId);
          setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);
          console.log('Tasks fetched separately:', tasksResponse);
          console.log('Number of tasks from separate call:', Array.isArray(tasksResponse) ? tasksResponse.length : 0);
        } catch (tasksError) {
          console.log('Could not fetch tasks separately:', tasksError);
          setTasks([]);
        }
      } else {
        console.error('Unexpected response format:', response);
        setError('Invalid project data format');
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError('Failed to load project data');
    }
    setLoading(false);
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task clicked:', task);
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
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
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center"
                >
                  <i className="ri-add-line w-4 h-4 mr-2"></i>
                  Add New Task
                </button>
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
                          task.taskType === 'Bug'
                            ? 'bg-red-100 text-red-800'
                            : task.taskType === 'Feature'
                            ? 'bg-blue-100 text-blue-800'
                            : task.taskType === 'Enhancement'
                            ? 'bg-purple-100 text-purple-800'
                            : task.taskType === 'Documentation'
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
                          <button
                            onClick={() => handleEditTask(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                            title="Edit Task"
                          >
                            <i className="ri-edit-line w-3 h-3 mr-1"></i>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 shadow-sm"
                            title="Delete Task"
                          >
                            <i className="ri-delete-bin-line w-3 h-3 mr-1"></i>
                            Delete
                          </button>
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
          userId=""
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