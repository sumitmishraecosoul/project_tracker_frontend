'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

// Note: Debug features (debug section, console logs, test buttons) are only visible in development mode
// They will be automatically hidden in production builds

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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear selected users when currentTeamMembers changes
  useEffect(() => {
    console.log('TeamMemberManagement - currentTeamMembers changed:', currentTeamMembers);
    console.log('TeamMemberManagement - currentTeamMembers length:', currentTeamMembers.length);
    
    // Clear any selected users that are now team members
    const newSelectedUsers = selectedUsers.filter(userId => 
      !currentTeamMembers.some(member => {
        const memberUserId = getTeamMemberUserId(member);
        return memberUserId === userId;
      })
    );
    
    if (newSelectedUsers.length !== selectedUsers.length) {
      setSelectedUsers(newSelectedUsers);
      console.log('TeamMemberManagement - Cleared selected users who are now team members');
    }
  }, [currentTeamMembers, selectedUsers]);

  const fetchUsers = async () => {
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('TeamMemberManagement - Manual refresh triggered');
    try {
      await fetchUsers();
      onTeamUpdate(); // This will refresh the project data and update currentTeamMembers
      console.log('TeamMemberManagement - Manual refresh completed');
    } catch (error) {
      console.error('TeamMemberManagement - Manual refresh failed:', error);
      setError('Failed to refresh data');
    }
  };

  // Helper function to get user ID from team member
  const getTeamMemberUserId = (member: any): string => {
    // Handle nested user object structure from backend
    if (member.user && member.user._id) {
      return member.user._id; // Nested user object: { user: { _id: '...' } }
    } else if (member._id) {
      return member._id; // Direct user object: { _id: '...' }
    }
    return '';
  };

  // Helper function to get user name from team member
  const getTeamMemberName = (member: any): string => {
    // Handle nested user object structure from backend
    if (member.user && member.user.name) {
      return member.user.name; // Nested user object
    } else if (member.name) {
      return member.name; // Direct user object
    }
    return 'Unknown User';
  };

  // Helper function to get user email from team member
  const getTeamMemberEmail = (member: any): string => {
    // Handle nested user object structure from backend
    if (member.user && member.user.email) {
      return member.user.email; // Nested user object
    } else if (member.email) {
      return member.email; // Direct user object
    }
    return '';
  };

  // Helper function to get user role from team member
  const getTeamMemberRole = (member: any): string => {
    return member.role || 'member';
  };

  // Helper function to get user department from team member
  const getTeamMemberDepartment = (member: any): string => {
    // Handle nested user object structure from backend
    if (member.user && member.user.department) {
      return member.user.department; // Nested user object
    } else if (member.department) {
      return member.department; // Direct user object
    }
    return '';
  };

  // Enhanced function to check if a user is already a team member
  const isUserTeamMember = (userId: string): boolean => {
    return currentTeamMembers.some(member => {
      const memberUserId = getTeamMemberUserId(member);
      return memberUserId === userId;
    });
  };

  // Enhanced available users filtering - ONLY show users who are NOT team members
  const availableUsers = users.filter(user => {
    const isAlreadyMember = isUserTeamMember(user._id);
    if (isAlreadyMember) {
      console.log(`Filtering out ${user.name} (${user._id}) - already a team member`);
    }
    return !isAlreadyMember;
  });

  const handleAddTeamMembers = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!projectId || projectId.trim() === '') {
      setError('Invalid project ID');
      return;
    }

    // Check if any selected users are already team members
    const alreadyMembers = selectedUsers.filter(userId => 
      currentTeamMembers.some(member => {
        const memberUserId = getTeamMemberUserId(member);
        return memberUserId === userId;
      })
    );

    if (alreadyMembers.length > 0) {
      const userNames = users
        .filter(user => alreadyMembers.includes(user._id))
        .map(user => user.name)
        .join(', ');
      setError(`The following users are already team members: ${userNames}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('TeamMemberManagement - Adding team members for project:', projectId);
      console.log('TeamMemberManagement - Project ID type:', typeof projectId);
      console.log('TeamMemberManagement - Selected users:', selectedUsers);
      console.log('TeamMemberManagement - Current team members count:', currentTeamMembers.length);
      console.log('TeamMemberManagement - Current team members:', currentTeamMembers);
      
      const teamMembers = selectedUsers.map(userId => ({ userId }));
      console.log('TeamMemberManagement - Team members data:', teamMembers);
      
      // Try bulk add first
      try {
        const result = await apiService.bulkAddTeamMembers(projectId, teamMembers);
        console.log('TeamMemberManagement - Bulk API response:', result);
        console.log('TeamMemberManagement - Bulk add successful!');
      } catch (bulkError) {
        console.log('TeamMemberManagement - Bulk add failed, trying individual adds:', bulkError);
        
        // Try individual adds
        try {
          for (const member of teamMembers) {
            try {
              await apiService.addTeamMember(projectId, member.userId);
              console.log('TeamMemberManagement - Added member:', member.userId);
            } catch (individualError) {
              console.error('TeamMemberManagement - Failed to add individual member:', member.userId, individualError);
              
              // Check if it's a duplicate user error
              if (individualError instanceof Error && individualError.message.includes('already a team member')) {
                const userName = users.find(u => u._id === member.userId)?.name || member.userId;
                throw new Error(`${userName} is already a team member`);
              }
              
              throw new Error(`Failed to add team member ${member.userId}: ${individualError instanceof Error ? individualError.message : 'Unknown error'}`);
            }
          }
          console.log('TeamMemberManagement - Individual adds successful!');
        } catch (individualAddError) {
          console.log('TeamMemberManagement - Individual adds failed, trying project update method:', individualAddError);
          
          // Final fallback: Use project update method
          try {
            console.log('TeamMemberManagement - Using project update fallback method...');
            await apiService.addTeamMembersViaProjectUpdate(projectId, selectedUsers);
            console.log('TeamMemberManagement - Added members via project update successfully!');
          } catch (projectUpdateError) {
            console.error('TeamMemberManagement - Project update method failed:', projectUpdateError);
            throw new Error(`Failed to add team members: ${projectUpdateError instanceof Error ? projectUpdateError.message : 'Unknown error'}`);
          }
        }
      }
      
      console.log('TeamMemberManagement - All team member operations completed successfully!');
      onTeamUpdate();
      onClose();
    } catch (error) {
      console.error('TeamMemberManagement - Failed to add team members:', error);
      setError(`Failed to add team members: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log('TeamMemberManagement - Removing team member:', userId);
      console.log('TeamMemberManagement - Current team members before removal:', currentTeamMembers);
      
      // Verify the user is actually a team member before attempting removal
      const isActuallyMember = isUserTeamMember(userId);
      if (!isActuallyMember) {
        throw new Error('User is not a team member');
      }

      // Try the dedicated team member removal API first
      try {
        console.log('TeamMemberManagement - Attempting removal via team member API...');
        await apiService.removeTeamMember(projectId, userId);
        console.log('TeamMemberManagement - Successfully removed via team member API');
      } catch (removeError) {
        console.log('TeamMemberManagement - Team member API failed, trying project update method:', removeError);
        
        // Fallback: Use project update method
        console.log('TeamMemberManagement - Attempting removal via project update...');
        await apiService.removeTeamMemberViaProjectUpdate(projectId, userId);
        console.log('TeamMemberManagement - Successfully removed via project update');
      }
      
      console.log('TeamMemberManagement - Team member removal completed successfully!');
      console.log('TeamMemberManagement - Refreshing project data...');
      onTeamUpdate();
      onClose(); // Close modal after successful removal
    } catch (error) {
      console.error('TeamMemberManagement - Failed to remove team member:', error);
      setError(`Failed to remove team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Debug logging for filtering - only in development
  useEffect(() => {
    if (!isDevelopment) return;
    
    console.log('TeamMemberManagement - Debug Info:');
    console.log('- Total users:', users.length);
    console.log('- Current team members:', currentTeamMembers.length);
    console.log('- Available users:', availableUsers.length);
    console.log('- Selected users:', selectedUsers.length);
    
    if (currentTeamMembers.length > 0) {
      console.log('- Current team member IDs:', currentTeamMembers.map(member => getTeamMemberUserId(member)));
      console.log('- Current team member details:', currentTeamMembers.map(member => ({
        id: getTeamMemberUserId(member),
        name: getTeamMemberName(member),
        structure: member
      })));
    }
    
    if (availableUsers.length > 0) {
      console.log('- Available user IDs:', availableUsers.map(user => user._id));
      console.log('- Available user names:', availableUsers.map(user => user.name));
    }
    
    // Check for any users that should be filtered out but aren't
    const shouldBeFiltered = users.filter(user => {
      const isMember = isUserTeamMember(user._id);
      if (isMember) {
        console.log(`User ${user.name} (${user._id}) should be filtered out because they are a team member`);
      }
      return isMember;
    });
    
    if (shouldBeFiltered.length > 0) {
      console.log('- Users that should be filtered out:', shouldBeFiltered.map(user => user.name));
    }
    
    // Check for any users that are incorrectly showing in availableUsers
    const incorrectlyAvailable = availableUsers.filter(user => isUserTeamMember(user._id));
    
    if (incorrectlyAvailable.length > 0) {
      console.log('- ❌ USERS INCORRECTLY SHOWING IN AVAILABLE USERS:', incorrectlyAvailable.map(user => user.name));
      console.log('- This indicates a filtering issue!');
    } else {
      console.log('- ✅ All filtering is working correctly - no team members in available users list');
    }

    // Log the filtering logic for each user
    console.log('- Filtering logic check:');
    users.forEach(user => {
      const isMember = isUserTeamMember(user._id);
      const isAvailable = availableUsers.some(availableUser => availableUser._id === user._id);
      console.log(`  ${user.name}: isMember=${isMember}, isAvailable=${isAvailable}, shouldBeAvailable=${!isMember}`);
    });
  }, [users, currentTeamMembers, availableUsers, selectedUsers, isDevelopment]);

  const testApiEndpoint = async () => {
    if (!isDevelopment) return;
    
    try {
      console.log('TeamMemberManagement - Testing API endpoints for project:', projectId);
      
      // Test 1: Check if project endpoint is accessible
      const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('TeamMemberManagement - Project endpoint test:', {
        status: projectResponse.status,
        ok: projectResponse.ok
      });
      
      // Test 2: Check if team member endpoints exist
      const teamMemberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectId}/team-members`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('TeamMemberManagement - Team member endpoint test:', {
        status: teamMemberResponse.status,
        ok: teamMemberResponse.ok
      });
      
      // Test 3: Check if bulk endpoint exists
      const bulkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${projectId}/team-members/bulk`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('TeamMemberManagement - Bulk endpoint test:', {
        status: bulkResponse.status,
        ok: bulkResponse.ok
      });
      
      let resultMessage = 'API Endpoint Test Results:\n';
      resultMessage += `Project Endpoint: ${projectResponse.ok ? '✅ Available' : '❌ Not Available'}\n`;
      resultMessage += `Team Member Endpoint: ${teamMemberResponse.ok ? '✅ Available' : '❌ Not Available'}\n`;
      resultMessage += `Bulk Endpoint: ${bulkResponse.ok ? '✅ Available' : '❌ Not Available'}\n`;
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        resultMessage += `\nCurrent Project Data:\n`;
        resultMessage += `- Title: ${projectData.title}\n`;
        resultMessage += `- TeamMembers: ${JSON.stringify(projectData.teamMembers)}\n`;
        resultMessage += `- AssignedTo: ${JSON.stringify(projectData.assignedTo)}\n`;
      }
      
      alert(resultMessage);
    } catch (error) {
      console.error('TeamMemberManagement - Test error:', error);
      alert(`API endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test filtering logic - only in development
  const testFiltering = () => {
    if (!isDevelopment) return;
    
    console.log('=== FILTERING TEST ===');
    console.log('All users:', users.map(u => ({ id: u._id, name: u.name })));
    console.log('Current team members:', currentTeamMembers.map(m => ({ id: getTeamMemberUserId(m), name: getTeamMemberName(m) })));
    console.log('Available users:', availableUsers.map(u => ({ id: u._id, name: u.name })));
    
    // Check for issues
    const incorrectlyAvailable = availableUsers.filter(user => isUserTeamMember(user._id));
    if (incorrectlyAvailable.length > 0) {
      console.error('❌ ISSUE: These users should NOT be in available list:', incorrectlyAvailable.map(u => u.name));
      alert(`❌ FILTERING ISSUE: ${incorrectlyAvailable.length} team members incorrectly showing in available list:\n${incorrectlyAvailable.map(u => u.name).join(', ')}`);
    } else {
      console.log('✅ Filtering working correctly');
      alert('✅ Filtering working correctly - no team members in available list');
    }
  };

  // Debug current data structure - only in development
  const debugDataStructure = () => {
    if (!isDevelopment) return;
    
    console.log('=== DATA STRUCTURE DEBUG ===');
    console.log('Current team members structure:', currentTeamMembers);
    console.log('Users structure:', users);
    
    currentTeamMembers.forEach((member, index) => {
      console.log(`Team member ${index}:`, {
        member,
        userId: getTeamMemberUserId(member),
        name: getTeamMemberName(member),
        email: getTeamMemberEmail(member),
        role: getTeamMemberRole(member),
        department: getTeamMemberDepartment(member)
      });
    });
    
    alert(`Debug info logged to console.\nTeam members: ${currentTeamMembers.length}\nUsers: ${users.length}\nAvailable users: ${availableUsers.length}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Manage Team Members</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line w-6 h-6"></i>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Debug Section - Only show in development mode */}
        {isDevelopment && (
          <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> Project ID: {projectId} | Selected Users: {selectedUsers.length} | Current Members: {currentTeamMembers.length}
                <br />
                <span className="text-xs">
                  Available Users: {availableUsers.length} | Filtering Status: {
                    availableUsers.some(user => isUserTeamMember(user._id)) 
                      ? '❌ ISSUE - Team members showing in available list' 
                      : '✅ WORKING - No team members in available list'
                  }
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleManualRefresh}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Refresh Data
                </button>
                <button
                  onClick={testApiEndpoint}
                  className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                >
                  Test API
                </button>
                <button
                  onClick={testFiltering}
                  className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                >
                  Test Filtering
                </button>
                <button
                  onClick={debugDataStructure}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Debug Data
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Team Members */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Team Members</h3>
              <div className="space-y-3">
                {currentTeamMembers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team members assigned</p>
                ) : (
                  currentTeamMembers.map((member) => (
                    <div key={getTeamMemberUserId(member)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{getTeamMemberName(member)}</div>
                        <div className="text-sm text-gray-500">{getTeamMemberEmail(member)}</div>
                        <div className="text-xs text-gray-400">{getTeamMemberRole(member)} • {getTeamMemberDepartment(member)}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveTeamMember(getTeamMemberUserId(member))}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Team Members */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Members</h3>
              {availableUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">All users are already team members</p>
              ) : (
                <>
                   {/* Filtering Status Message - Only show in development mode */}
                   {isDevelopment && availableUsers.some(user => isUserTeamMember(user._id)) && (
                     <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                       ⚠️ WARNING: Some team members are incorrectly showing in this list. This indicates a filtering issue.
                     </div>
                   )}
                   {isDevelopment && !availableUsers.some(user => isUserTeamMember(user._id)) && availableUsers.length > 0 && (
                     <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
                       ✅ Filtering working correctly - no current team members in this list.
                     </div>
                   )}
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 mb-4">
                    {availableUsers.map((user) => {
                      const isAlreadyMember = isUserTeamMember(user._id);
                      return (
                        <label key={user._id} className={`flex items-center space-x-3 py-2 cursor-pointer ${isAlreadyMember ? 'opacity-50' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserToggle(user._id)}
                            disabled={isAlreadyMember}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                              {isAlreadyMember && <span className="ml-2 text-xs text-green-600">(Already Member)</span>}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.role} • {user.department}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleAddTeamMembers}
                    disabled={loading || selectedUsers.length === 0}
                    className="w-full px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
