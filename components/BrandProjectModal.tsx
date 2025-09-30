'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';
import { useBrand } from './BrandContext';
import { useProjects } from './ProjectContext';

interface Brand {
  id: string;
  name: string;
  color?: string;
  logo?: string;
}

interface BrandProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
  selectedBrand?: Brand;
}

export default function BrandProjectModal({ 
  isOpen, 
  onClose, 
  onProjectCreated, 
  selectedBrand 
}: BrandProjectModalProps) {
  const { brands, currentBrand } = useBrand();
  const { getBrandProjects } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active' as 'Active' | 'Completed' | 'On Hold',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    startDate: '',
    dueDate: '',
    color: '#3B82F6',
    privacy: 'Private' as 'Public' | 'Private',
    template: 'Blank' as 'Blank' | 'Task List' | 'Kanban Board' | 'Timeline',
    brandId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  const templates = [
    { id: 'blank', name: 'Blank', description: 'Start from scratch' },
    { id: 'task-list', name: 'Task List', description: 'Organized task management' },
    { id: 'kanban', name: 'Kanban Board', description: 'Visual workflow management' },
    { id: 'timeline', name: 'Timeline', description: 'Project timeline view' }
  ];

  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData(prev => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        dueDate: nextMonth.toISOString().split('T')[0],
        color: selectedBrand?.color || currentBrand?.settings?.theme === 'dark' ? '#8B5CF6' : '#3B82F6',
        brandId: selectedBrand?.id || currentBrand?.id || ''
      }));
    }
  }, [isOpen, selectedBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const brandId = formData.brandId || selectedBrand?.id || currentBrand?.id;
      if (!brandId) {
        throw new Error('No brand selected');
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority || 'Medium',
        department: 'India E-commerce', // Default department
        startDate: formData.startDate || undefined,
        endDate: formData.dueDate || undefined,
        tags: [], // Default empty tags
        settings: {
          allowComments: true,
          allowAttachments: true,
          notifications: true
        }
      };

      const result = await apiService.createProject(brandId, projectData);
      
      // Refresh the project list to show the new project immediately
      if (currentBrand?.id) {
        await getBrandProjects(currentBrand.id);
      }
      
      onProjectCreated(result);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'Active',
        priority: 'Medium',
        startDate: '',
        dueDate: '',
        color: '#3B82F6',
        privacy: 'Private',
        template: 'Blank',
        brandId: ''
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              {selectedBrand && (
                <p className="text-sm text-gray-600 mt-1">
                  Creating project for <span className="font-medium" style={{ color: selectedBrand.color }}>
                    {selectedBrand.name}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your project"
              />
            </div>

            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <div className="grid grid-cols-3 gap-3">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleInputChange('brandId', brand.id)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.brandId === brand.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: (brand as any).color || '#3B82F6' }}
                    >
                      <span className="text-white text-xs font-bold">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      formData.color === color.value
                        ? 'border-gray-400 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleInputChange('template', template.name)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.template === template.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="Private"
                    checked={formData.privacy === 'Private'}
                    onChange={(e) => handleInputChange('privacy', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Private</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    value="Public"
                    checked={formData.privacy === 'Public'}
                    onChange={(e) => handleInputChange('privacy', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Public</span>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="ri-add-line mr-2"></i>
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
