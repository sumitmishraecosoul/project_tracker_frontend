'use client';

import React, { useState } from 'react';
import { Category, UpdateCategoryData } from '../lib/types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (data: UpdateCategoryData) => void;
  onDelete?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected = false,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateCategoryData>({
    name: category.name,
    description: category.description,
    color: category.color,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      onDelete();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <div>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              placeholder="Category name"
            />
          </div>
          
          <div>
            <textarea
              name="description"
              value={editData.description || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Description (optional)"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: editData.color }}
            ></div>
            <span className="text-sm text-gray-600">Color</span>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !editData.name?.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div
            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: category.color }}
          ></div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {category.name}
            </h4>
            {category.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500">
                {category.taskCount || 0} tasks
              </span>
              {category.is_default && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Default
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Edit category"
          >
            <i className="ri-edit-line text-sm"></i>
          </button>
          {!category.is_default && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete category"
            >
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
