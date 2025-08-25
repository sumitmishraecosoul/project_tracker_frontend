'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface UserTask {
  id: string;
  userId: string;
  date: string;
  typeOfWork: string;
  workDescription: string;
  project: string;
  task: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  status: 'Pending' | 'In Progress' | 'Completed';
  hoursSpent?: number;
  notes?: string;
}

interface Project {
  id: string;
  title: string;
}

interface Task {
  id: string;
  task: string;
  description?: string;
  taskType: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
  assignedTo?: { _id: string; name: string; email: string } | string;
  reporter?: { _id: string; name: string; email: string } | string;
  startDate?: string;
  eta: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
}

interface EditUserTaskModalProps {
  task: UserTask;
  onSave: (task: UserTask) => void;
  onClose: () => void;
}

interface NewTaskData {
  projectId: string;
  task: string;
  description?: string;
  taskType: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled';
  assignedTo: string;
  reporter: string;
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
}

export default function EditUserTaskModal({ task, onSave, onClose }: EditUserTaskModalProps) {
  const [formData, setFormData] = useState<UserTask>(task);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState<NewTaskData>({
    projectId: '',
    task: '',
    description: '',
    taskType: 'Daily',
    priority: 'Medium',
    status: 'Yet to Start',
    assignedTo: '',
    reporter: '',
    startDate: new Date().toISOString().split('T')[0],
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    estimatedHours: 0,
    actualHours: 0,
    remark: '',
    roadBlock: '',
    supportNeeded: '',
    labels: [],
    attachments: [],
    relatedTasks: [],
    parentTask: '',
    sprint: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  // If Daily chosen in create-new inline form, default dates to today
  useEffect(() => {
    if (newTaskData.taskType === 'Daily') {
      const today = new Date().toISOString().split('T')[0];
      setNewTaskData(prev => ({ ...prev, startDate: today, eta: today }));
    }
  }, [newTaskData.taskType]);

  useEffect(() => {
    if (formData.project) {
      fetchProjectTasks(formData.project);
      // Update newTaskData with selected project
      setNewTaskData(prev => ({ ...prev, projectId: formData.project }));
    } else {
      setTasks([]);
    }
  }, [formData.project]);

  const fetchProjects = async () => {
    try {
      // Fetch ALL projects for the dropdown (no pagination)
      const params = {
        limit: 1000, // Large limit to get all projects
        page: 1
      };
      
      const data = await apiService.getProjects(params);
      console.log('EditUserTaskModal - Fetched all projects data:', data);
      
      // Ensure data is an array - handle different response formats
      let projectsData = [];
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        projectsData = data.data;
      }
      console.log('EditUserTaskModal - Processed all projects data:', projectsData);
      
      // Sort alphabetically by title
      const sortedProjects = projectsData.sort((a: Project, b: Project) => a.title.localeCompare(b.title));
      setProjects(sortedProjects as Project[]);
    } catch (error) {
      console.error('Failed to fetch all projects:', error);
      setProjects([]); // Set empty array on error
    }
  };

  const fetchProjectTasks = async (projectId: string) => {
    try {
      console.log('Fetching tasks for project:', projectId);
      // Try project-specific endpoint first
      let data = await apiService.getProjectTasks(projectId);
      console.log('Fetched tasks from project endpoint:', data);
      
      // If no tasks found, try fetching all tasks and filtering
      if (!data || data.length === 0) {
        console.log('No tasks found from project endpoint, trying all tasks...');
        const allTasks = await apiService.getTasks();
        console.log('All tasks:', allTasks);
        data = allTasks.filter((task: any) => task.projectId === projectId);
        console.log('Filtered tasks for project:', data);
      }
      
      // Ensure data is an array
      const tasksData = Array.isArray(data) ? data : [];
      setTasks(tasksData as unknown as Task[]);
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      // Fallback: try to get all tasks and filter
      try {
        console.log('Trying fallback: fetch all tasks...');
        const allTasks = await apiService.getTasks();
        // Ensure allTasks is an array
        const allTasksArray = Array.isArray(allTasks) ? allTasks : [];
        const filteredTasks = allTasksArray.filter((task: any) => task.projectId === projectId);
        console.log('Fallback filtered tasks:', filteredTasks);
        setTasks(filteredTasks as unknown as Task[]);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setTasks([]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSave(formData);
    setLoading(false);
  };

  const handleInputChange = (field: keyof UserTask, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewTaskInputChange = (field: keyof NewTaskData, value: any) => {
    setNewTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      console.log('Creating new task:', newTaskData);
      
      // Create the new task
      const createdTask = await apiService.createTask(newTaskData);
      console.log('Task created successfully:', createdTask);
      
      // Refresh the tasks list for the current project
      await fetchProjectTasks(newTaskData.projectId);
      
      // Set the newly created task as selected
      setFormData(prev => ({ ...prev, task: createdTask.id }));
      
      // Hide the create task form
      setShowCreateTask(false);
      
      // Reset new task data
      setNewTaskData(prev => ({
        ...prev,
        task: '',
        description: '',
        assignedTo: '',
        reporter: ''
      }));
      
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line w-6 h-6"></i>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Work</label>
              <input
                type="text"
                value={formData.typeOfWork}
                onChange={(e) => handleInputChange('typeOfWork', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Description</label>
              <textarea
                value={formData.workDescription}
                onChange={(e) => handleInputChange('workDescription', e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a project</option>
                {Array.isArray(projects) && projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
              <select
                value={formData.task}
                onChange={(e) => handleInputChange('task', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.project}
              >
                <option value="">Select a task</option>
                {tasks.length === 0 && formData.project ? (
                  <option value="" disabled>No tasks found for this project</option>
                ) : (
                  Array.isArray(tasks) && tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.task} - {task.status}
                    </option>
                  ))
                )}
              </select>
              {formData.project && (
                <div className="mt-2">
                  {(!Array.isArray(tasks) || tasks.length === 0) && (
                    <p className="text-sm text-gray-500 mb-2">
                      {!Array.isArray(tasks) ? 'Error loading tasks' : 'No tasks found for this project.'}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCreateTask(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create New Task
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Adhoc">Adhoc</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours Spent</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.hoursSpent || 0}
                onChange={(e) => handleInputChange('hoursSpent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* New Task Creation Form */}
          {showCreateTask && (
            <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line w-5 h-5"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                  <input
                    type="text"
                    value={newTaskData.task}
                    onChange={(e) => handleNewTaskInputChange('task', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                  <select
                    value={newTaskData.taskType}
                    onChange={(e) => handleNewTaskInputChange('taskType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Adhoc">Adhoc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => handleNewTaskInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newTaskData.status}
                    onChange={(e) => handleNewTaskInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Yet to Start">Yet to Start</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Recurring">Recurring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
                  <input
                    type="text"
                    value={newTaskData.assignedTo}
                    onChange={(e) => handleNewTaskInputChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter assignee name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reporter *</label>
                  <input
                    type="text"
                    value={newTaskData.reporter}
                    onChange={(e) => handleNewTaskInputChange('reporter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter reporter name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTaskData.startDate}
                    onChange={(e) => handleNewTaskInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ETA *</label>
                  <input
                    type="date"
                    value={newTaskData.eta}
                    onChange={(e) => handleNewTaskInputChange('eta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTaskData.estimatedHours ?? ''}
                    onChange={(e) => handleNewTaskInputChange('estimatedHours', e.target.value === '' ? undefined as any : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTaskData.actualHours ?? ''}
                    onChange={(e) => handleNewTaskInputChange('actualHours', e.target.value === '' ? undefined as any : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => handleNewTaskInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateTask}
                  disabled={loading || !newTaskData.task || !newTaskData.assignedTo || !newTaskData.reporter}
                  className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}