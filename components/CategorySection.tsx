'use client';

import React from 'react';
import { useCategories } from './CategoryContext';

export default function CategorySection() {
  const { categories, loading, error, createDefaultCategories } = useCategories();
  
  console.log('CategorySection: Render with', { 
    categories: categories.length, 
    loading, 
    error,
    categoriesData: categories 
  });

  const handleCreateDefaultCategories = async () => {
    try {
      await createDefaultCategories();
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white p-6 text-center">
        <p className="text-gray-600 mb-4">No categories found. This project doesn't have any categories yet.</p>
        <p className="text-sm text-gray-500 mb-4">
          Categories should be automatically created when a project is created. 
          If you're seeing this message, the default categories may not have been created.
        </p>
        <div className="space-x-3">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Page
          </button>
          <button 
            onClick={handleCreateDefaultCategories}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Default Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <h3 className="text-lg font-semibold mb-4">Categories ({categories.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="p-4 rounded-lg border"
            style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
          >
            <h4 className="font-semibold" style={{ color: category.color }}>
              {category.name}
            </h4>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Order: {category.order} | Default: {category.is_default ? 'Yes' : 'No'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
