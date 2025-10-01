'use client';

import React, { useState, useEffect } from 'react';
import { useBrand } from './BrandContext';
import { useBrandUser } from './BrandUserContext';
import { BrandUser, InviteUserRequest, AddUserRequest, UpdateUserRequest } from '../lib/types';
import { config } from '../lib/config';

interface BrandUserManagementProps {
  onClose?: () => void;
}

export default function BrandUserManagement({ onClose }: BrandUserManagementProps) {
  const { currentBrand } = useBrand();
  const { 
    brandUsers, 
    isLoading, 
    error, 
    getBrandUsers,
    addUserToBrand,
    inviteUserToBrand,
    updateUserRole,
    removeUserFromBrand
  } = useBrandUser();

  const [activeTab, setActiveTab] = useState<'users' | 'invite' | 'add'>('users');
  const [editingUser, setEditingUser] = useState<BrandUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invite form data
  const [inviteFormData, setInviteFormData] = useState<InviteUserRequest>({
    email: '',
    role: 'member',
    message: ''
  });

  // Add user form data
  const [addFormData, setAddFormData] = useState<AddUserRequest>({
    email: '',
    role: 'member',
    permissions: {}
  });

  // Edit user form data
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({
    role: '',
    permissions: {}
  });

  useEffect(() => {
    if (currentBrand?.id) {
      console.log('BrandUserManagement - Loading users for brand:', currentBrand.id);
      getBrandUsers(currentBrand.id);
    }
  }, [currentBrand?.id]);

  // Debug: Log when brandUsers changes
  useEffect(() => {
    console.log('BrandUserManagement - brandUsers updated:', {
      count: brandUsers.length,
      users: brandUsers.map((u: BrandUser) => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: u.status }))
    });
  }, [brandUsers]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.id) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await inviteUserToBrand(currentBrand.id, inviteFormData);
      if (response.success) {
        setSuccessMessage('User invited successfully!');
        setInviteFormData({ email: '', role: 'member', message: '' });
        setActiveTab('users');
        // The context already refreshes the user list, but let's ensure it's visible
        console.log('User invited successfully, user list should be refreshed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to invite user';
      setActionError(errorMessage);
      console.error('Error inviting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.id) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await addUserToBrand(currentBrand.id, addFormData);
      if (response.success) {
        setSuccessMessage('User added successfully!');
        setAddFormData({ email: '', role: 'member', permissions: {} });
        setActiveTab('users');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to add user';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!currentBrand?.id) return;

    try {
      setActionError(null);
      await updateUserRole(currentBrand.id, userId, { role: newRole });
      setSuccessMessage('User role updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update user role';
      setActionError(errorMessage);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!currentBrand?.id) return;

    if (window.confirm(`Are you sure you want to remove "${userName}" from this brand?`)) {
      try {
        setActionError(null);
        await removeUserFromBrand(currentBrand.id, userId);
        setSuccessMessage('User removed successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to remove user';
      setActionError(errorMessage);
      }
    }
  };

  const startEditingUser = (user: BrandUser) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role,
      permissions: user.permissions
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditFormData({ role: '', permissions: {} });
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.id || !editingUser) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await updateUserRole(currentBrand.id, editingUser.id, editFormData);
      if (response.success) {
        setSuccessMessage('User updated successfully!');
        setEditingUser(null);
        setEditFormData({ role: '', permissions: {} });
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update user';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'member': return 'text-green-600 bg-green-100';
      case 'client': return 'text-orange-600 bg-orange-100';
      case 'guest': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentBrand) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <i className="ri-building-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Please select a brand to manage users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users for <span className="font-medium text-blue-600">{currentBrand.name}</span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {(error || actionError) && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {typeof (error || actionError) === 'string' ? (error || actionError) : JSON.stringify(error || actionError)}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users ({brandUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'invite'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Invite User
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'add'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Add User
        </button>
      </div>

      {/* Users List Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
                <span className="text-gray-600">Loading users...</span>
              </div>
            </div>
          ) : brandUsers.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">Invite or add users to get started</p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setActiveTab('invite')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Invite User
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {brandUsers.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded" />
                        ) : (
                          <span className="text-gray-600 font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.toUpperCase()}
                          </span>
                          {user.invited_by && (
                            <span className="text-xs text-gray-500">
                              Invited by {user.invited_by.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingUser?.id === user.id ? (
                        <form onSubmit={handleEditUser} className="flex items-center space-x-2">
                          <select
                            value={editFormData.role}
                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                            <option value="guest">Guest</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingUser(user)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id, user.name)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite User Tab */}
      {activeTab === 'invite' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite User to Brand</h2>
          
          <form onSubmit={handleInviteUser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={inviteFormData.email}
                onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter existing user's email"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Only existing users in the database can be invited
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={inviteFormData.role}
                onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={inviteFormData.message}
                onChange={(e) => setInviteFormData({ ...inviteFormData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Welcome message for the user"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !inviteFormData.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Inviting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Tab */}
      {activeTab === 'add' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add User to Brand</h2>
          
          <form onSubmit={handleAddUser} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter existing user's email"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Add an existing user directly to the brand
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={addFormData.role}
                onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !addFormData.email}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="ri-user-add-line mr-2"></i>
                    Add User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
