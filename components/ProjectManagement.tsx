'use client';

import React, { useState, useEffect } from 'react';
import { useBrand } from './BrandContext';
import { useProjects } from './ProjectContext';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../lib/types';

interface ProjectManagementProps {
  onClose?: () => void;
}

export default function ProjectManagement({ onClose }: ProjectManagementProps) {
  const { currentBrand } = useBrand();
  const { 
    projects, 
    isLoading, 
    error, 
    getBrandProjects,
    createProject,
    getProjectDetails,
    updateProject,
    updateProjectStatus,
    completeProject,
    archiveProject,
    deleteProject
  } = useProjects();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'details'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateProjectRequest>({
    title: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    department: 'India E-commerce',
    startDate: '',
    endDate: '',
    tags: [],
    settings: {
      allowComments: true,
      allowAttachments: true,
      notifications: true
    }
  });

  // Edit form data
  const [editFormData, setEditFormData] = useState<UpdateProjectRequest>({
    title: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    department: 'India E-commerce',
    startDate: '',
    endDate: '',
    tags: []
  });

  useEffect(() => {
    if (currentBrand?.id) {
      getBrandProjects(currentBrand.id);
    }
  }, [currentBrand?.id]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.id) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await createProject(currentBrand.id, formData);
      if (response.success) {
        setSuccessMessage('Project created successfully!');
        
        // Refresh the project list to show the new project immediately
        await getBrandProjects(currentBrand.id);
        
        setFormData({
          title: '',
          description: '',
          status: 'Active',
          priority: 'Medium',
          department: 'India E-commerce',
          startDate: '',
          endDate: '',
          tags: [],
          settings: {
            allowComments: true,
            allowAttachments: true,
            notifications: true
          }
        });
        setActiveTab('list');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to create project';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.id || !editingProject) return;

    setIsSubmitting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await updateProject(currentBrand.id, editingProject.id, editFormData);
      if (response.success) {
        setSuccessMessage('Project updated successfully!');
        
        // Refresh the project list to show the updated project
        await getBrandProjects(currentBrand.id);
        
        setEditingProject(null);
        setEditFormData({
          title: '',
          description: '',
          status: 'Active',
          priority: 'Medium',
          department: 'India E-commerce',
          startDate: '',
          endDate: '',
          tags: []
        });
        setActiveTab('list');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update project';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    if (!currentBrand?.id) return;

    try {
      setActionError(null);
      await updateProjectStatus(currentBrand.id, projectId, newStatus);
      setSuccessMessage('Project status updated successfully!');
      
      // Refresh the project list to show the updated status
      await getBrandProjects(currentBrand.id);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update project status';
      setActionError(errorMessage);
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    if (!currentBrand?.id) return;

    try {
      setActionError(null);
      await completeProject(currentBrand.id, projectId);
      setSuccessMessage('Project completed successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to complete project';
      setActionError(errorMessage);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    if (!currentBrand?.id) return;

    try {
      setActionError(null);
      await archiveProject(currentBrand.id, projectId);
      setSuccessMessage('Project archived successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to archive project';
      setActionError(errorMessage);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!currentBrand?.id) return;

    if (window.confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      try {
        setActionError(null);
        await deleteProject(currentBrand.id, projectId);
        setSuccessMessage('Project deleted successfully!');
        
        // Refresh the project list to remove the deleted project
        await getBrandProjects(currentBrand.id);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || 'Failed to delete project';
        setActionError(errorMessage);
      }
    }
  };

  const startEditingProject = (project: Project) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title || '',
      description: project.description || '',
      status: project.status || 'Active',
      priority: project.priority || 'Medium',
      department: project.department || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      tags: project.tags || []
    });
    setActiveTab('create');
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditFormData({
      title: '',
      description: '',
      status: 'Active',
      priority: 'Medium',
      department: 'India E-commerce',
      startDate: '',
      endDate: '',
      tags: []
    });
    setActiveTab('list');
  };

  const viewProjectDetails = async (project: Project) => {
    if (!currentBrand?.id) return;

    try {
      setActionError(null);
      await getProjectDetails(currentBrand.id, project.id);
      setSelectedProject(project);
      setActiveTab('details');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to load project details';
      setActionError(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Completed': return 'text-purple-600 bg-purple-100';
      case 'On Hold': return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentBrand) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <i className="ri-building-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Please select a brand to manage projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">
            Manage projects for <span className="font-medium text-blue-600">{currentBrand.name}</span>
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
          Projects ({(projects || []).length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {editingProject ? 'Edit Project' : 'Create Project'}
        </button>
        {selectedProject && (
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Project Details
          </button>
        )}
      </div>

      {/* Projects List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
                <span className="text-gray-600">Loading projects...</span>
              </div>
            </div>
          ) : (projects || []).length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-folder-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(projects || []).map((project) => (
                <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{project.title || 'Untitled Project'}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description || 'No description'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status || 'Unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority || 'Unknown'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <i className="ri-building-line mr-1"></i>
                        {project.department || 'No Department'}
                      </span>
                      {project.endDate && (
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1"></i>
                          {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{project.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewProjectDetails(project)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => startEditingProject(project)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      <select
                        value={project.status || 'Active'}
                        onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="Active">Active</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold (Archive Alternative)</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled (Archive Alternative)</option>
                      </select>
                      
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title || 'Untitled Project')}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Project Tab */}
      {activeTab === 'create' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          
          <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editingProject ? editFormData.title : formData.title}
                  onChange={(e) => editingProject ? 
                    setEditFormData({ ...editFormData, title: e.target.value }) :
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={editingProject ? editFormData.department : formData.department}
                  onChange={(e) => editingProject ?
                    setEditFormData({ ...editFormData, department: e.target.value }) :
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="India E-commerce">India E-commerce</option>
                  <option value="US E-commerce">US E-commerce</option>
                  <option value="UK E-commerce">UK E-commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={editingProject ? editFormData.status : formData.status}
                  onChange={(e) => editingProject ?
                    setEditFormData({ ...editFormData, status: e.target.value }) :
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold (Archive Alternative)</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled (Archive Alternative)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={editingProject ? editFormData.priority : formData.priority}
                  onChange={(e) => editingProject ?
                    setEditFormData({ ...editFormData, priority: e.target.value }) :
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingProject ? editFormData.startDate : formData.startDate}
                  onChange={(e) => editingProject ?
                    setEditFormData({ ...editFormData, startDate: e.target.value }) :
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={editingProject ? editFormData.endDate : formData.endDate}
                  onChange={(e) => editingProject ?
                    setEditFormData({ ...editFormData, endDate: e.target.value }) :
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={editingProject ? editFormData.description : formData.description}
                onChange={(e) => editingProject ?
                  setEditFormData({ ...editFormData, description: e.target.value }) :
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Enter project description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editingProject ? editFormData.tags?.join(', ') : formData.tags?.join(', ')}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  editingProject ?
                    setEditFormData({ ...editFormData, tags }) :
                    setFormData({ ...formData, tags })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={editingProject ? cancelEditing : () => setActiveTab('list')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    {editingProject ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`${editingProject ? "ri-save-line" : "ri-add-line"} mr-2`}></i>
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project Details Tab */}
      {activeTab === 'details' && selectedProject && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{selectedProject.title || 'Untitled Project'}</h2>
            <button
              onClick={() => setActiveTab('list')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Back to Projects
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                {selectedProject.status || 'Unknown'}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProject.priority)}`}>
                {selectedProject.priority || 'Unknown'}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Department</h3>
              <p className="text-sm text-gray-900">{selectedProject.department || 'No Department'}</p>
            </div>

            {selectedProject.startDate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
                <p className="text-sm text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
              </div>
            )}

            {selectedProject.endDate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-2">End Date</h3>
                <p className="text-sm text-gray-900">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <p className="text-sm text-gray-900">{selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900">{selectedProject.description || 'No description available'}</p>
          </div>

          {selectedProject.tags && selectedProject.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}


          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => startEditingProject(selectedProject)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Project
            </button>
            <button
              onClick={() => handleCompleteProject(selectedProject.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Project
            </button>
            <button
              onClick={() => handleDeleteProject(selectedProject.id, selectedProject.title || 'Untitled Project')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
