'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';
import { Project, User, NewTask } from '../lib/types';

interface AddTaskModalProps {
  projectId?: string;
  onSave: (task: NewTask) => void;
  onClose: () => void;
}

export default function AddTaskModal({ projectId, onSave, onClose }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    task: '',
    description: '',
    taskType: 'Daily' as 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc',
    priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
    status: 'Yet to Start' as 'Yet to Start' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold' | 'Cancelled' | 'Recurring',
    assignedTo: '',
    reporter: '',
    startDate: '',
    eta: '',
    estimatedHours: 0,
    actualHours: 0,
    remark: '',
    roadBlock: '',
    supportNeeded: '',
    labels: [] as string[],
    attachments: [] as string[],
    relatedTasks: [] as string[],
    parentTask: '',
    sprint: ''
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    getCurrentUser();
  }, []);

  // If Daily is selected, default dates to today
  useEffect(() => {
    if (formData.taskType === 'Daily') {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: today,
        eta: today
      }));
    }
  }, [formData.taskType]);

  // Handle recurring task status changes
  useEffect(() => {
    if (formData.status === 'Recurring') {
      // Clear start date and eta for recurring tasks
      setFormData(prev => ({
        ...prev,
        startDate: '',
        eta: ''
      }));
    }
  }, [formData.status]);

  const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  };

  const fetchProjects = async () => {
    try {
      // Fetch ALL projects for the dropdown (no pagination)
      const params = {
        limit: 1000, // Large limit to get all projects
        page: 1
      };
      
      const data = await apiService.getProjects(params);
      console.log('AddTaskModal - Fetched all projects data:', data);
      
      // Ensure data is an array - handle different response formats
      let projectsData = [];
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        projectsData = data.data;
      }
      console.log('AddTaskModal - Processed all projects data:', projectsData);
      
      // Sort alphabetically by title
      const sortedProjects = projectsData.sort((a: Project, b: Project) => a.title.localeCompare(b.title));
      setProjects(sortedProjects as Project[]);
    } catch (error) {
      console.error('Failed to fetch all projects:', error);
      setProjects([]); // Set empty array on error
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data as User[]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare task data based on status
    let taskData = {
      ...formData,
      reporter: currentUser?.name || '',
      estimatedHours: formData.estimatedHours || 0,
      actualHours: formData.actualHours || 0
    };

    // For recurring tasks, ensure date fields are not sent
    if (formData.status === 'Recurring') {
      const { startDate, eta, ...recurringTaskData } = taskData;
      taskData = recurringTaskData as any;
    }
    
    console.log('Submitting task:', taskData);
    
    try {
      onSave(taskData);
    } catch (error) {
      console.error('Error saving task:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (field: 'estimatedHours' | 'actualHours', value: string) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [field]: '' as any }));
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return;
    }
    setFormData(prev => ({ ...prev, [field]: parsed as any }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
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
            {!projectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
              <input
                type="text"
                value={formData.task}
                onChange={(e) => handleInputChange('task', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter task description"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select
                  value={formData.taskType}
                  onChange={(e) => handleInputChange('taskType', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporter</label>
                <input
                  type="text"
                  value={formData.reporter}
                  onChange={(e) => handleInputChange('reporter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter reporter name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {formData.status !== 'Recurring' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ETA</label>
                  <input
                    type="date"
                    value={formData.eta}
                    onChange={(e) => handleInputChange('eta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {formData.status === 'Recurring' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <i className="ri-information-line text-blue-500 mr-2"></i>
                  <p className="text-sm text-blue-700">
                    <strong>Recurring Task:</strong> This task repeats regularly without specific start/end dates. 
                    Date fields are automatically hidden for recurring tasks.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                   value={formData.estimatedHours ?? ''}
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
                   value={formData.actualHours ?? ''}
                   onChange={(e) => handleHoursChange('actualHours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
              <textarea
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter any remarks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Road Block</label>
              <textarea
                value={formData.roadBlock}
                onChange={(e) => handleInputChange('roadBlock', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe any roadbloacks ('Feature', 'Bug', 'Enhancement', 'Documentation', 'Research',)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Needed</label>
              <textarea
                value={formData.supportNeeded}
                onChange={(e) => handleInputChange('supportNeeded', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe support needed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sprint</label>
              <input
                type="text"
                value={formData.sprint}
                onChange={(e) => handleInputChange('sprint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter sprint name"
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
              disabled={loading}
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