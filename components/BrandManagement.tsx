'use client';

import React, { useState } from 'react';
import { useBrand } from './BrandContext';
import { Brand, CreateBrandData, UpdateBrandData } from '../lib/types';
import BrandUserManagement from './BrandUserManagement';
import ProjectManagement from './ProjectManagement';

interface BrandManagementProps {
  onClose?: () => void;
}

export default function BrandManagement({ onClose }: BrandManagementProps) {
  const { 
    brands, 
    currentBrand, 
    isLoading, 
    error, 
    createBrand, 
    updateBrand, 
    switchToBrand, 
    deleteBrand 
  } = useBrand();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'users' | 'projects'>('list');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBrandData>({
    name: '',
    description: '',
    logo: '',
    settings: {
      theme: 'light',
      notifications: true,
      timezone: 'UTC'
    }
  });

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await createBrand(formData);
      if (response.success) {
        setSuccessMessage('Brand created successfully!');
        setFormData({
          name: '',
          description: '',
          logo: '',
          settings: {
            theme: 'light',
            notifications: true,
            timezone: 'UTC'
          }
        });
        setActiveTab('list');
      }
    } catch (error: any) {
      console.error('Brand creation error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create brand';
      
      if (error.message) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          errorMessage = `Brand "${formData.name}" already exists. Please choose a different name.`;
        } else if (error.message.includes('validation')) {
          errorMessage = `Invalid brand data: ${error.message}`;
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = 'You do not have permission to create brands.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const updateData: UpdateBrandData = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        settings: formData.settings
      };

      const response = await updateBrand(editingBrand.id, updateData);
      if (response.success) {
        setSuccessMessage('Brand updated successfully!');
        setEditingBrand(null);
        setFormData({
          name: '',
          description: '',
          logo: '',
          settings: {
            theme: 'light',
            notifications: true,
            timezone: 'UTC'
          }
        });
      }
    } catch (error: any) {
      setActionError(error.message || 'Failed to update brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchBrand = async (brandId: string) => {
    try {
      setActionError(null);
      await switchToBrand(brandId);
      setSuccessMessage('Switched to brand successfully!');
    } catch (error: any) {
      setActionError(error.message || 'Failed to switch brand');
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (window.confirm(`Are you sure you want to delete "${brandName}"? This action cannot be undone.`)) {
      try {
        setActionError(null);
        const response = await deleteBrand(brandId);
        if (response.success) {
          setSuccessMessage('Brand deleted successfully!');
        }
      } catch (error: any) {
        setActionError(error.message || 'Failed to delete brand');
      }
    }
  };

  const startEditing = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      settings: brand.settings || {
        theme: 'light',
        notifications: true,
        timezone: 'UTC'
      }
    });
  };

  const cancelEditing = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      logo: '',
      settings: {
        theme: 'light',
        notifications: true,
        timezone: 'UTC'
      }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-blue-600 bg-blue-100';
      case 'member': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubscriptionBadge = (subscription: any) => {
    if (!subscription) return null;
    
    const plan = subscription.plan || 'free';
    const status = subscription.status || 'active';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        plan === 'free' ? 'text-gray-600 bg-gray-100' :
        plan === 'pro' ? 'text-blue-600 bg-blue-100' :
        'text-purple-600 bg-purple-100'
      }`}>
        {plan.toUpperCase()}
        {status !== 'active' && (
          <span className="ml-1 text-orange-500">• {status}</span>
        )}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
          <span className="text-gray-600">Loading brands...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-1">Manage your brands and switch between them</p>
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

      {/* Current Brand */}
      {currentBrand && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentBrand.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{currentBrand.name}</h3>
                <p className="text-sm text-gray-600">Currently active</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(currentBrand.role)}`}>
                {currentBrand.role.toUpperCase()}
              </span>
              {getSubscriptionBadge(currentBrand.subscription)}
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {(error || actionError) && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error || actionError}
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
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Your Brands ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create Brand
        </button>
        {currentBrand && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manage Projects
            </button>
          </>
        )}
      </div>

      {/* Brands List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {brands.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-building-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands found</h3>
              <p className="text-gray-600 mb-4">Create your first brand to get started</p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Brand
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {brands.map((brand) => (
                <div key={brand.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded" />
                        ) : (
                          <span className="text-gray-600 font-bold text-lg">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                        <p className="text-sm text-gray-600">{brand.description || 'No description'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(brand.role)}`}>
                            {brand.role.toUpperCase()}
                          </span>
                          {getSubscriptionBadge(brand.subscription)}
                          {currentBrand?.id === brand.id && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentBrand?.id !== brand.id && (
                        <button
                          onClick={() => handleSwitchBrand(brand.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(brand)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      {brand.role === 'owner' && (
                        <button
                          onClick={() => handleDeleteBrand(brand.id, brand.name)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Brand Tab */}
      {activeTab === 'create' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBrand ? 'Edit Brand' : 'Create New Brand'}
          </h2>
          
          <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter brand name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.settings?.theme}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings!, theme: e.target.value as 'light' | 'dark' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.settings?.timezone}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings!, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={formData.settings?.notifications}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { ...formData.settings!, notifications: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
                  Enable notifications
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              {editingBrand && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    {editingBrand ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`ri-${editingBrand ? 'save' : 'add'}-line mr-2`}></i>
                    {editingBrand ? 'Update Brand' : 'Create Brand'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <BrandUserManagement />
      )}

      {/* Projects Management Tab */}
      {activeTab === 'projects' && (
        <ProjectManagement />
      )}
    </div>
  );
}
