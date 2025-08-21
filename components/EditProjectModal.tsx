
'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  assignedTo?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  }>;
}

interface ProjectFormData {
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  assignedTo: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface EditProjectModalProps {
  project: Project;
  onSave: (projectId: string, project: ProjectFormData) => void;
  onClose: () => void;
}

export default function EditProjectModal({ project, onSave, onClose }: EditProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project.title,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    dueDate: project.dueDate,
    assignedTo: project.assignedTo?.map(user => user._id) || []
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
    // Get current user for department filtering
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      setCurrentUser(JSON.parse(currentUserStr));
    }
  }, []);

  const fetchUsers = async () => {
    try {
      // Always fetch all assignable users for better team management
      const data = await apiService.getAssignableUsers();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert assignedTo string array to teamMembers format expected by API
    const teamMembers = formData.assignedTo.map(userId => ({
      user: userId,
      role: 'employee' // Default role for team members
    }));
    
    const updatedProject = {
      ...formData,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo, // Keep for backward compatibility
      teamMembers: teamMembers // Add the teamMembers field
    };
    
    onSave(project._id, updatedProject);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  // Filter users by search query and department
  const getFilteredUsers = () => {
    if (!currentUser) return { sameDepartment: [], differentDepartment: [] };

    const filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show ALL users from same department
    const sameDepartment = filteredUsers.filter(user => 
      user.department === currentUser.department
    );
    
    // Show ALL users from different departments
    const differentDepartment = filteredUsers.filter(user => 
      user.department !== currentUser.department
    );

    return { sameDepartment, differentDepartment };
  };

  const { sameDepartment, differentDepartment } = getFilteredUsers();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
              
              {/* Current Team Members Section - Top */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Project Team Members</h3>
                {formData.assignedTo.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team members assigned to this project</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formData.assignedTo.map((userId) => {
                      const user = users.find(u => u._id === userId);
                      return user ? (
                        <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.department}</div>
                          </div>
                          <button
                            onClick={() => handleUserToggle(userId)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 p-1 hover:bg-red-50 rounded ml-2"
                            title="Remove team member"
                          >
                            <i className="ri-close-line w-4 h-4"></i>
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Search Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Team Members</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or department..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Two Columns for User Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Team Members (Same Department) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    My Team Members ({sameDepartment.length})
                    <span className="text-sm text-gray-500 ml-2">• Same Department</span>
                  </h3>
                  
                  {sameDepartment.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available team members from your department</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {sameDepartment.map((user) => (
                        <label key={user._id} className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(user._id)}
                            onChange={() => handleUserToggle(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.role} • {user.department}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adhoc Team Members (Different Departments) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Adhoc Team Members ({differentDepartment.length})
                    <span className="text-sm text-gray-500 ml-2">• Different Departments</span>
                  </h3>
                  
                  {differentDepartment.length === 0 ? (
                    <p className="text-gray-500 text-sm">No team members from different departments available</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {differentDepartment.map((user) => (
                        <label key={user._id} className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(user._id)}
                            onChange={() => handleUserToggle(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.role} • {user.department}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
