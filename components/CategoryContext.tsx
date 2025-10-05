'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/api-service';

interface Category {
  _id: string;
  name: string;
  color: string;
  order: number;
  is_default: boolean;
  description?: string;
  project_id: string;
  brand_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: any) => Promise<any>;
  updateCategory: (categoryId: string, categoryData: any) => Promise<any>;
  deleteCategory: (categoryId: string) => Promise<any>;
  reorderCategories: (categoryOrders: any[]) => Promise<any>;
  createDefaultCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children, brandId, projectId }: { children: ReactNode; brandId: string; projectId: string }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log('CategoryProvider: Render with', { 
    brandId, 
    projectId, 
    categories: categories.length, 
    loading, 
    error,
    brandIdType: typeof brandId,
    projectIdType: typeof projectId,
    brandIdValue: brandId,
    projectIdValue: projectId
  });

  const fetchCategories = useCallback(async () => {
    try {
      console.log('CategoryContext: Starting fetchCategories, setting loading to true');
      setLoading(true);
      setError(null);
      
      if (!brandId || !projectId) {
        console.log('CategoryContext: Missing brandId or projectId', { brandId, projectId });
        return;
      }
      
      console.log('CategoryContext: Fetching categories for', { brandId, projectId });
      const response = await apiService.getProjectCategories(brandId, projectId);
      console.log('CategoryContext: API response', response);
      
      if (response.success) {
        console.log('CategoryContext: Setting categories to:', response.data);
        setCategories(response.data);
        console.log('CategoryContext: Categories fetched successfully:', response.data.length);
      } else {
        setError('Failed to fetch categories');
        console.log('CategoryContext: Failed to fetch categories');
      }
    } catch (error) {
      console.error('CategoryContext: Error fetching categories:', error);
      setError('Error fetching categories');
    } finally {
      console.log('CategoryContext: Setting loading to false');
      setLoading(false);
    }
  }, [brandId, projectId]);

  const createCategory = async (categoryData: any) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.createCategory(brandId, projectId, categoryData);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, categoryData: any) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.updateCategory(brandId, projectId, categoryId, categoryData);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to update category');
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.deleteCategory(brandId, projectId, categoryId);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to delete category');
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const reorderCategories = async (categoryOrders: any[]) => {
    try {
      if (!brandId || !projectId) return;
      
      const response = await apiService.reorderCategories(brandId, projectId, categoryOrders);
      if (response.success) {
        await fetchCategories(); // Refresh categories
        return response;
      }
      throw new Error('Failed to reorder categories');
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  };

  const createDefaultCategories = async () => {
    try {
      if (!brandId || !projectId) return;
      
      await apiService.createDefaultCategories(brandId, projectId);
      await fetchCategories(); // Refresh categories
    } catch (error) {
      console.error('Error creating default categories:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('CategoryProvider: useEffect triggered with', { brandId, projectId });
    if (brandId && projectId) {
      console.log('CategoryProvider: Calling fetchCategories');
      fetchCategories();
    } else {
      console.log('CategoryProvider: Missing brandId or projectId, not fetching');
    }
  }, [brandId, projectId, fetchCategories]);

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    createDefaultCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
