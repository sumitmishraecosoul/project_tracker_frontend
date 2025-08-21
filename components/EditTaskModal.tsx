'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

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
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  assignable?: boolean;
}

interface EditTaskModalProps {
  task: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export default function EditTaskModal({ task, onSave, onClose }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    ...task,
    // Format dates for input fields
    startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
    eta: task.eta ? new Date(task.eta).toISOString().split('T')[0] : ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // If Daily selected, default dates to today
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

  const fetchUsers = async () => {
    try {
      // Use the new RBAC helper endpoint for assignable users
      const data = await apiService.getAssignableUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch assignable users:', error);
      // Fallback to regular users endpoint if helper fails
      try {
        const fallbackData = await apiService.getUsers();
        setUsers(fallbackData);
      } catch (fallbackError) {
        console.error('Failed to fetch users (fallback):', fallbackError);
        setUsers([]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSave(formData);
    setLoading(false);
  };

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (field: 'estimatedHours' | 'actualHours', value: string) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [field]: undefined }));
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;
    setFormData(prev => ({ ...prev, [field]: parsed }));
  };

  const handleUserChange = (field: 'assignedTo' | 'reporter', userId: string) => {
    const selectedUser = users.find(user => user._id === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          _id: selectedUser._id,
          name: selectedUser.name,
          email: selectedUser.email
        }
      }));
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
              <input
                type="text"
                value={formData.task}
                onChange={(e) => handleInputChange('task', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select
                  value={formData.assignedTo._id}
                  onChange={(e) => handleUserChange('assignedTo', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporter</label>
                <select
                  value={formData.reporter._id}
                  onChange={(e) => handleUserChange('reporter', e.target.value)}
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
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.eta}
                  onChange={(e) => handleInputChange('eta', e.target.value)}
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
                value={formData.remark || ''}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter any remarks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Road Block</label>
              <textarea
                value={formData.roadBlock || ''}
                onChange={(e) => handleInputChange('roadBlock', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe any roadbloacks ('Feature', 'Bug', 'Enhancement', 'Documentation', 'Research',)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Needed</label>
              <textarea
                value={formData.supportNeeded || ''}
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
                value={formData.sprint || ''}
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}