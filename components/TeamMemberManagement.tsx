'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface TeamMember {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

interface TeamMemberManagementProps {
  projectId: string;
  currentTeamMembers: TeamMember[];
  onTeamUpdate: () => void;
  onClose: () => void;
}

export default function TeamMemberManagement({
  projectId,
  currentTeamMembers,
  onTeamUpdate,
  onClose
}: TeamMemberManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localTeamMembers, setLocalTeamMembers] = useState<TeamMember[]>(currentTeamMembers);
  const [isTeamMembersExpanded, setIsTeamMembersExpanded] = useState(false);

  useEffect(() => {
    fetchUsers();
    // Get current user for department filtering
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      setCurrentUser(JSON.parse(currentUserStr));
    }
  }, []);

  // Update local team members when prop changes
  useEffect(() => {
    const propsTeamMemberIds = currentTeamMembers.map(member => getTeamMemberUserId(member)).sort();
    const localTeamMemberIds = localTeamMembers.map(member => getTeamMemberUserId(member)).sort();
    
    const propsString = JSON.stringify(propsTeamMemberIds);
    const localString = JSON.stringify(localTeamMemberIds);
    
    if (propsString !== localString) {
      setLocalTeamMembers(currentTeamMembers);
    }
  }, [currentTeamMembers, localTeamMembers]);

  // Get current user for department filtering
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Clear selected users when localTeamMembers changes
  useEffect(() => {
    const newSelectedUsers = selectedUsers.filter(userId => 
      !localTeamMembers.some(member => {
        const memberUserId = getTeamMemberUserId(member);
        return memberUserId === userId;
      })
    );
    
    if (newSelectedUsers.length !== selectedUsers.length) {
      setSelectedUsers(newSelectedUsers);
    }
  }, [localTeamMembers, selectedUsers]);

  const fetchUsers = async () => {
    try {
      // Always fetch all assignable users for better team management
      const data = await apiService.getAssignableUsers();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  // Helper function to get user ID from team member
  const getTeamMemberUserId = (member: any): string => {
    if (member.user && member.user._id) {
      return member.user._id;
    } else if (member._id) {
      return member._id;
    }
    return '';
  };

  // Helper function to get user name from team member
  const getTeamMemberName = (member: any): string => {
    if (member.user && member.user.name) {
      return member.user.name;
    } else if (member.name) {
      return member.name;
    }
    return 'Unknown User';
  };

  // Helper function to get user email from team member
  const getTeamMemberEmail = (member: any): string => {
    if (member.user && member.user.email) {
      return member.user.email;
    } else if (member.email) {
      return member.email;
    }
    return '';
  };

  // Helper function to get user department from team member
  const getTeamMemberDepartment = (member: any): string => {
    if (member.user && member.user.department) {
      return member.user.department;
    } else if (member.department) {
      return member.department;
    }
    return '';
  };

  // Check if a user is already a team member
  const isUserTeamMember = (userId: string): boolean => {
    return localTeamMembers.some(member => {
      const memberUserId = getTeamMemberUserId(member);
      return memberUserId === userId;
    });
  };

  // Get users by department (same department vs different department)
  const getUsersByDepartment = () => {
    if (!currentUser) return { sameDepartment: [], differentDepartment: [] };

    // Show ALL users from same department (including current team members)
    const sameDepartment = users.filter(user => 
      user.department === currentUser.department
    );
    
    // Show ALL users from different departments (including current team members)
    const differentDepartment = users.filter(user => 
      user.department !== currentUser.department
    );

    return { sameDepartment, differentDepartment };
  };

  const { sameDepartment, differentDepartment } = getUsersByDepartment();

  const handleAddTeamMembers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!projectId || projectId.trim() === '') {
      setError('Invalid project ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const teamMembers = selectedUsers.map(userId => ({ userId }));
      
      // Get the user details for immediate UI update
      const usersToAdd = selectedUsers.map(userId => {
        const user = users.find(u => u._id === userId);
        return {
          user: {
            _id: userId,
            name: user?.name || 'Unknown User',
            email: user?.email || '',
            role: user?.role || 'employee',
            department: user?.department || ''
          }
        };
      });

      // Immediately update local state for better UI responsiveness
      setLocalTeamMembers(prev => [...prev, ...usersToAdd]);
      
      // Try bulk add first
      try {
        await apiService.bulkAddTeamMembers(projectId, teamMembers);
      } catch (bulkError) {
        // Try individual adds
        try {
          for (const member of teamMembers) {
            await apiService.addTeamMember(projectId, member.userId);
          }
        } catch (individualAddError) {
          // Final fallback: Use project update method
          await apiService.addTeamMembersViaProjectUpdate(projectId, selectedUsers);
        }
      }
      
      // Clear selected users
      setSelectedUsers([]);
      
      // Show success message
      setSuccess(`Successfully added ${selectedUsers.length} team member${selectedUsers.length !== 1 ? 's' : ''}!`);
      
      // Call the parent callback to update the main component
      onTeamUpdate();
      
      // Close the modal after successful addition
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to add team members:', error);
      setError(`Failed to add team members: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Revert the local state change if the API call failed
      setLocalTeamMembers(currentTeamMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Verify the user is actually a team member
      const isActuallyMember = isUserTeamMember(userId);
      if (!isActuallyMember) {
        throw new Error('User is not a team member');
      }

      // Immediately update local state for better UI responsiveness
      setLocalTeamMembers(prev => prev.filter(member => {
        const memberUserId = getTeamMemberUserId(member);
        return memberUserId !== userId;
      }));

      // Try the dedicated team member removal API first
      try {
        await apiService.removeTeamMember(projectId, userId);
      } catch (removeError) {
        // Fallback: Use project update method
        await apiService.removeTeamMemberViaProjectUpdate(projectId, userId);
      }
      
      // Show success message
      setSuccess('Team member removed successfully!');
      
      // Call the parent callback to update the main component
      onTeamUpdate();
      
      // Close the modal after successful removal
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to remove team member:', error);
      setError(`Failed to remove team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Revert the local state change if the API call failed
      setLocalTeamMembers(currentTeamMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    // Don't allow toggling if user is already a team member
    if (isUserTeamMember(userId)) {
      return;
    }
    
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Manage Team Members</h2>
            <div className="flex items-center space-x-2">
                             <button
                 onClick={() => {
                   setLocalTeamMembers(currentTeamMembers);
                 }}
                 className="text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                 title="Refresh team members"
               >
                <i className="ri-refresh-line w-5 h-5"></i>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line w-6 h-6"></i>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div className="p-6">
          {/* Current Team Members Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Current Project Team Members</h3>
              {localTeamMembers.length > 5 && (
                <button
                  onClick={() => setIsTeamMembersExpanded(!isTeamMembersExpanded)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isTeamMembersExpanded ? (
                    <>
                      <i className="ri-arrow-up-s-line mr-1"></i>
                      Show Less
                    </>
                  ) : (
                    <>
                      <i className="ri-arrow-down-s-line mr-1"></i>
                      Show All ({localTeamMembers.length})
                    </>
                  )}
                </button>
              )}
            </div>
            {localTeamMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">No team members assigned to this project</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(isTeamMembersExpanded ? localTeamMembers : localTeamMembers.slice(0, 5)).map((member) => (
                  <div key={getTeamMemberUserId(member)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{getTeamMemberName(member)}</div>
                      <div className="text-sm text-gray-500">{getTeamMemberEmail(member)}</div>
                      <div className="text-xs text-gray-400">{getTeamMemberDepartment(member)}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeamMember(getTeamMemberUserId(member))}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 p-1 hover:bg-red-50 rounded ml-2"
                      title="Remove team member"
                    >
                      <i className="ri-close-line w-4 h-4"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Users to Add:</label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = users.find(u => u._id === userId);
                  return user ? (
                    <div key={userId} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <span>{user.name}</span>
                      <button
                        onClick={() => handleUserToggle(userId)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <i className="ri-close-line w-3 h-3"></i>
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Two Columns for User Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Team Members (Same Department) */}
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
                        checked={selectedUsers.includes(user._id) || isUserTeamMember(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                        disabled={isUserTeamMember(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {isUserTeamMember(user._id) && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current Member</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.role} • {user.department}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Adhoc Team Members (Different Department) */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adhoc Team Members ({differentDepartment.length})
                <span className="text-sm text-gray-500 ml-2">• Different Department</span>
              </h3>
              
              {differentDepartment.length === 0 ? (
                <p className="text-gray-500 text-sm">No available team members from other departments</p>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {differentDepartment.map((user) => (
                    <label key={user._id} className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id) || isUserTeamMember(user._id)}
                        onChange={() => handleUserToggle(user._id)}
                        disabled={isUserTeamMember(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                          {isUserTeamMember(user._id) && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current Member</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.role} • {user.department}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Button */}
          {selectedUsers.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAddTeamMembers}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''} to Project`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
