'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface Project {
  _id: string;
  id?: string;
  title: string;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  assignable?: boolean;
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

interface AddUserTaskModalProps {
  userId?: string;
  projectId?: string; // Optional project ID for project context
  onAdd: (task: any) => void;
  onClose: () => void;
}

export default function AddUserTaskModal({ userId, projectId, onAdd, onClose }: AddUserTaskModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [newTaskData, setNewTaskData] = useState<NewTaskData>({
    projectId: projectId || '', // Use projectId if provided
    task: '',
    description: '',
    taskType: 'Daily',
    priority: 'Medium',
    status: 'Yet to Start',
    assignedTo: userId || '', // Use userId if provided
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
    fetchUsers();
    getCurrentUser();
  }, []);

  // If Daily is selected, default dates to today
  useEffect(() => {
    if (newTaskData.taskType === 'Daily') {
      const today = new Date().toISOString().split('T')[0];
      setNewTaskData(prev => ({ ...prev, startDate: today, eta: today }));
    }
  }, [newTaskData.taskType]);

  // Set default reporter when current user is available
  useEffect(() => {
    if (currentUser && currentUser._id && !newTaskData.reporter) {
      setNewTaskData(prev => ({ ...prev, reporter: currentUser._id }));
    }
  }, [currentUser, newTaskData.reporter]);

  const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      console.log('AddUserTaskModal - Fetched projects data:', data);
      
      // Ensure data is an array - handle different response formats
      let projectsData = [];
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        projectsData = data.data;
      }
      console.log('AddUserTaskModal - Processed projects data:', projectsData);
      
      setProjects(projectsData as Project[]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]); // Set empty array on error
    }
  };

  const fetchUsers = async () => {
    try {
      // Get current user to determine department-based filtering
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      let usersData: User[] = [];
      
      if (currentUser?.role === 'admin') {
        // Admin can see all users
        const data = await apiService.getUsers();
        usersData = Array.isArray(data) ? data : [];
      } else if (currentUser?.role === 'manager' || currentUser?.role === 'employee') {
        // Manager and employee can only see users from their department
        const data = await apiService.getUsers();
        usersData = Array.isArray(data) ? data.filter(user => user.department === currentUser.department) : [];
      } else {
        // Fallback to assignable users endpoint
        const data = await apiService.getAssignableUsers();
        usersData = Array.isArray(data) ? data : [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const handleNewTaskInputChange = (field: keyof NewTaskData, value: any) => {
    setNewTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (field: 'estimatedHours' | 'actualHours', value: string) => {
    if (value === '') {
      setNewTaskData(prev => ({ ...prev, [field]: undefined as any }));
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;
    setNewTaskData(prev => ({ ...prev, [field]: parsed }));
  };

  const handleCreateTask = async () => {
    try {
      setLoading(true);
      console.log('Creating new task with data:', newTaskData);
      
      // Validate required fields
      if (!newTaskData.projectId || !newTaskData.task || !newTaskData.assignedTo || !newTaskData.reporter || !newTaskData.eta) {
        console.error('Missing required fields:', {
          projectId: newTaskData.projectId,
          task: newTaskData.task,
          assignedTo: newTaskData.assignedTo,
          reporter: newTaskData.reporter,
          eta: newTaskData.eta
        });
        setError('Please fill in all required fields: Project, Task Name, Assigned To, Reporter, and End Date');
        setLoading(false);
        return;
      }
      
      // Additional validation for user IDs
      if (!newTaskData.assignedTo || !newTaskData.reporter) {
        console.error('Invalid user IDs:', {
          assignedTo: newTaskData.assignedTo,
          reporter: newTaskData.reporter
        });
        setError('Please select valid users for Assigned To and Reporter');
        setLoading(false);
        return;
      }

      // Get current user to check role-based restrictions
      const currentUserStr = localStorage.getItem('currentUser');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      // Backend now handles all RBAC restrictions, so we don't need frontend validation
      // The backend will enforce department-based restrictions for employees and managers
      
      // Map the data to match backend expectations
      const taskDataForAPI = {
        projectId: newTaskData.projectId,
        task: newTaskData.task,
        description: newTaskData.description || '',
        taskType: newTaskData.taskType,
        status: newTaskData.status,
        priority: newTaskData.priority,
        assignedTo: newTaskData.assignedTo,
        reporter: newTaskData.reporter,
        startDate: newTaskData.startDate,
        eta: newTaskData.eta,
        estimatedHours: newTaskData.estimatedHours || 0,
        actualHours: newTaskData.actualHours || 0,
        remark: newTaskData.remark || '',
        roadBlock: newTaskData.roadBlock || '',
        supportNeeded: newTaskData.supportNeeded || '',
        labels: newTaskData.labels || [],
        attachments: newTaskData.attachments || [],
        relatedTasks: newTaskData.relatedTasks || [],
        parentTask: newTaskData.parentTask || '',
        sprint: newTaskData.sprint || ''
      };
      
      console.log('Task data for API:', taskDataForAPI);
      console.log('Users available:', users);
      console.log('Selected assignedTo:', newTaskData.assignedTo);
      console.log('Selected reporter:', newTaskData.reporter);
      
      // Find the selected users to verify the data
      const assignedUser = users.find(u => u._id === newTaskData.assignedTo);
      const reporterUser = users.find(u => u._id === newTaskData.reporter);
      console.log('Assigned user found:', assignedUser);
      console.log('Reporter user found:', reporterUser);
      
      // Create the new task
      const createdTask = await apiService.createTask(taskDataForAPI);
      console.log('Task created successfully:', createdTask);
      
      // Clear any previous errors
      setError('');
      
      // Call the onAdd callback with the created task
      onAdd(createdTask);
      
      // Close the modal
      onClose();
      
    } catch (error) {
      console.error('Failed to create task:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      
      // Handle specific backend errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('getManagerTeamUserIds is not defined')) {
        setError('Task creation failed due to a backend configuration issue. Please contact your administrator or try again later.');
      } else if (errorMessage.includes('HTTP 400')) {
        setError('Task creation failed. Please check that all required fields are filled correctly and try again.');
      } else {
        setError(`Failed to create task: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line w-6 h-6"></i>
            </button>
          </div>
          {/* Role-based guidance */}
          <div className="mt-2 text-sm text-gray-600">
            {currentUser?.role === 'employee' && (
              <p className="text-blue-600">💡 As an employee, you can create tasks for users in your department</p>
            )}
            {currentUser?.role === 'manager' && (
              <p className="text-blue-600">💡 As a manager, you can assign tasks to your team members</p>
            )}
            {currentUser?.role === 'admin' && (
              <p className="text-blue-600">💡 As an admin, you can assign tasks to anyone</p>
            )}
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}


        
        <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <select
                value={newTaskData.projectId}
                onChange={(e) => handleNewTaskInputChange('projectId', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a project</option>
                {Array.isArray(projects) && projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Name *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newTaskData.description}
                onChange={(e) => handleNewTaskInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter task description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sprint</label>
                <input
                  type="text"
                  value={newTaskData.sprint}
                  onChange={(e) => handleNewTaskInputChange('sprint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sprint name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To *</label>
                <select
                  value={newTaskData.assignedTo}
                  onChange={(e) => handleNewTaskInputChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option 
                      key={user._id} 
                      value={user._id}
                      disabled={user.assignable === false}
                    >
                      {user.name} ({user.email}) {user.assignable === false ? '(Not Assignable)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporter *</label>
                <select
                  value={newTaskData.reporter}
                  onChange={(e) => handleNewTaskInputChange('reporter', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option 
                      key={user._id} 
                      value={user._id}
                      disabled={user.assignable === false}
                    >
                      {user.name} ({user.email}) {user.assignable === false ? '(Not Assignable)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={newTaskData.startDate}
                  onChange={(e) => handleNewTaskInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={newTaskData.eta}
                  onChange={(e) => handleNewTaskInputChange('eta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <input
                  type="number"
                  min="0"
                  step="0.5"
                    value={newTaskData.estimatedHours ?? ''}
                    onChange={(e) => handleHoursChange('estimatedHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Hours</label>
                  <input
                  type="number"
                  min="0"
                  step="0.5"
                    value={newTaskData.actualHours ?? ''}
                    onChange={(e) => handleHoursChange('actualHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
              <textarea
                value={newTaskData.remark}
                onChange={(e) => handleNewTaskInputChange('remark', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter any remarks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Road Block</label>
              <textarea
                value={newTaskData.roadBlock}
                onChange={(e) => handleNewTaskInputChange('roadBlock', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe any roadbloacks ('Feature', 'Bug', 'Enhancement', 'Documentation', 'Research',)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Needed</label>
              <textarea
                value={newTaskData.supportNeeded}
                onChange={(e) => handleNewTaskInputChange('supportNeeded', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe support needed"
              />
            </div>
          </div>

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
              disabled={loading || !newTaskData.task || !newTaskData.assignedTo || !newTaskData.reporter || !newTaskData.projectId}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

