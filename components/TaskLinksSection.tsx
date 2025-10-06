'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface TaskLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  order: number;
  created_by?: {
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

interface TaskLinksSectionProps {
  taskId: string;
  brandId: string;
}

const TaskLinksSection: React.FC<TaskLinksSectionProps> = ({ taskId, brandId }) => {
  const [links, setLinks] = useState<TaskLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    description: ''
  });
  const [editLink, setEditLink] = useState({
    name: '',
    url: '',
    description: ''
  });

  // Load links when component mounts or taskId changes
  useEffect(() => {
    if (taskId && brandId) {
      loadLinks();
    }
  }, [taskId, brandId]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      console.log('TaskLinksSection: Loading links for task', taskId);
      const response = await apiService.getTaskLinks(brandId, taskId);
      console.log('TaskLinksSection: Links loaded', response);
      
      if (response.success && response.data) {
        // Sort links by order
        const sortedLinks = response.data.sort((a: TaskLink, b: TaskLink) => a.order - b.order);
        setLinks(sortedLinks);
      }
    } catch (error) {
      console.error('TaskLinksSection: Error loading links', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      alert('Please fill in both name and URL');
      return;
    }

    try {
      console.log('TaskLinksSection: Creating new link', newLink);
      const response = await apiService.createTaskLink(brandId, taskId, {
        name: newLink.name.trim(),
        url: newLink.url.trim(),
        description: newLink.description.trim() || undefined
      });

      if (response.success) {
        console.log('TaskLinksSection: Link created successfully', response.data);
        setLinks([...links, response.data]);
        setNewLink({ name: '', url: '', description: '' });
        setIsAdding(false);
      }
    } catch (error) {
      console.error('TaskLinksSection: Error creating link', error);
      alert('Failed to create link. Please try again.');
    }
  };

  const handleEditLink = async (linkId: string) => {
    if (!editLink.name.trim() || !editLink.url.trim()) {
      alert('Please fill in both name and URL');
      return;
    }

    try {
      console.log('TaskLinksSection: Updating link', linkId, editLink);
      const response = await apiService.updateTaskLink(brandId, taskId, linkId, {
        name: editLink.name.trim(),
        url: editLink.url.trim(),
        description: editLink.description.trim() || undefined
      });

      if (response.success) {
        console.log('TaskLinksSection: Link updated successfully', response.data);
        setLinks(links.map(link => link.id === linkId ? response.data : link));
        setEditingLink(null);
        setEditLink({ name: '', url: '', description: '' });
      }
    } catch (error) {
      console.error('TaskLinksSection: Error updating link', error);
      alert('Failed to update link. Please try again.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      console.log('TaskLinksSection: Deleting link', linkId);
      const response = await apiService.deleteTaskLink(brandId, taskId, linkId);

      if (response.success) {
        console.log('TaskLinksSection: Link deleted successfully');
        setLinks(links.filter(link => link.id !== linkId));
      }
    } catch (error) {
      console.error('TaskLinksSection: Error deleting link', error);
      alert('Failed to delete link. Please try again.');
    }
  };

  const startEditing = (link: TaskLink) => {
    setEditingLink(link.id);
    setEditLink({
      name: link.name,
      url: link.url,
      description: link.description || ''
    });
  };

  const cancelEditing = () => {
    setEditingLink(null);
    setEditLink({ name: '', url: '', description: '' });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewLink({ name: '', url: '', description: '' });
  };

  const getLinkIcon = (url: string) => {
    if (url.includes('docs.google.com') || url.includes('sheets.google.com')) {
      return '📊';
    } else if (url.includes('figma.com')) {
      return '🎨';
    } else if (url.includes('github.com')) {
      return '💻';
    } else if (url.includes('drive.google.com')) {
      return '📁';
    } else if (url.includes('notion.so')) {
      return '📝';
    } else {
      return '🔗';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <i className="ri-links-line text-lg text-gray-600"></i>
          <h3 className="text-sm font-medium text-gray-900">Task Links</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {links.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <i className="ri-add-line text-sm"></i>
          <span>Add Link</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading links...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-links-line text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm text-gray-500">No links added yet</p>
            <p className="text-xs text-gray-400 mt-1">Add links to supporting documents, sheets, or resources</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={link.id} className="group border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                {editingLink === link.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Link Name</label>
                      <input
                        type="text"
                        value={editLink.name}
                        onChange={(e) => setEditLink({ ...editLink, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Project Requirements Sheet"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={editLink.url}
                        onChange={(e) => setEditLink({ ...editLink, url: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://docs.google.com/spreadsheets/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={editLink.description}
                        onChange={(e) => setEditLink({ ...editLink, description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of this link"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditLink(link.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">{getLinkIcon(link.url)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {link.name}
                          </a>
                          {link.description && (
                            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">
                              Added {new Date(link.created_at).toLocaleDateString()}
                            </span>
                            {link.created_by && (
                              <span className="text-xs text-gray-400">
                                by {link.created_by.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(link)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit link"
                          >
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete link"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Link Form */}
        {isAdding && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Link</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link Name *</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Project Requirements Sheet"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of this link"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddLink}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Add Link
                </button>
                <button
                  onClick={cancelAdding}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskLinksSection;
