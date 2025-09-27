'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { useBrand } from './BrandContext';
import { 
  Subtask, 
  CreateSubtaskData, 
  UpdateSubtaskData, 
  SubtaskTemplate, 
  CreateSubtaskTemplateData, 
  UpdateSubtaskTemplateData, 
  SubtaskAnalytics, 
  SubtaskFilters, 
  SubtaskSearchResult,
  ReorderSubtasksRequest,
  ApplyTemplateRequest
} from '../lib/types';

interface SubtaskContextType {
  // State
  subtasks: Subtask[];
  subtaskTemplates: SubtaskTemplate[];
  loading: boolean;
  error: string | null;

  // Subtask CRUD Operations
  getBrandSubtasks: () => Promise<void>;
  createSubtask: (data: CreateSubtaskData) => Promise<Subtask>;
  getSubtaskById: (subtaskId: string) => Promise<Subtask>;
  updateSubtask: (subtaskId: string, data: UpdateSubtaskData) => Promise<Subtask>;
  deleteSubtask: (subtaskId: string) => Promise<void>;

  // Task-specific Subtask Operations
  getTaskSubtasks: (taskId: string) => Promise<Subtask[]>;

  // Assignment & Status Operations
  assignSubtask: (subtaskId: string, userId: string) => Promise<Subtask>;
  unassignSubtask: (subtaskId: string) => Promise<Subtask>;
  updateSubtaskStatus: (subtaskId: string, status: string) => Promise<Subtask>;
  updateSubtaskPriority: (subtaskId: string, priority: string) => Promise<Subtask>;

  // Organization Operations
  reorderSubtasks: (subtaskIds: string[]) => Promise<void>;
  reorderTaskSubtasks: (taskId: string, subtaskIds: string[]) => Promise<void>;
  completeSubtask: (subtaskId: string) => Promise<Subtask>;
  uncompleteSubtask: (subtaskId: string) => Promise<Subtask>;

  // Template Operations
  getSubtaskTemplates: () => Promise<void>;
  getSubtaskTemplateById: (templateId: string) => Promise<SubtaskTemplate>;
  createSubtaskTemplate: (data: CreateSubtaskTemplateData) => Promise<SubtaskTemplate>;
  updateSubtaskTemplate: (templateId: string, data: UpdateSubtaskTemplateData) => Promise<SubtaskTemplate>;
  deleteSubtaskTemplate: (templateId: string) => Promise<void>;

  // Template Application
  applyTemplateToTask: (data: ApplyTemplateRequest) => Promise<void>;

  // Analytics Operations
  getSubtaskAnalytics: () => Promise<SubtaskAnalytics>;
  getSubtaskAnalyticsById: (subtaskId: string) => Promise<SubtaskAnalytics>;
  getTaskSubtaskAnalytics: (taskId: string) => Promise<SubtaskAnalytics>;

  // Search & Filtering Operations
  searchSubtasks: (query: string, filters?: SubtaskFilters) => Promise<SubtaskSearchResult>;
  filterSubtasks: (filters: SubtaskFilters) => Promise<SubtaskSearchResult>;

  // Utility Functions
  clearError: () => void;
  refreshSubtasks: () => Promise<void>;
}

const SubtaskContext = createContext<SubtaskContextType | undefined>(undefined);

export const useSubtasks = () => {
  const context = useContext(SubtaskContext);
  if (context === undefined) {
    throw new Error('useSubtasks must be used within a SubtaskProvider');
  }
  return context;
};

interface SubtaskProviderProps {
  children: ReactNode;
}

export const SubtaskProvider: React.FC<SubtaskProviderProps> = ({ children }) => {
  const { currentBrand } = useBrand();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskTemplates, setSubtaskTemplates] = useState<SubtaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utility Functions
  const clearError = () => setError(null);

  const refreshSubtasks = async () => {
    await getBrandSubtasks();
  };

  // Subtask CRUD Operations
  const getBrandSubtasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBrandSubtasks();
      setSubtasks(response.subtasks || []);
    } catch (err: any) {
      console.error('Error fetching brand subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtasks');
    } finally {
      setLoading(false);
    }
  };

  const createSubtask = async (data: CreateSubtaskData): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createBrandSubtask(data);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error creating subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to create subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubtaskById = async (subtaskId: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBrandSubtaskById(subtaskId);
      return response.subtask;
    } catch (err: any) {
      console.error('Error fetching subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubtask = async (subtaskId: string, data: UpdateSubtaskData): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateBrandSubtask(subtaskId, data);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error updating subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to update subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubtask = async (subtaskId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteBrandSubtask(subtaskId);
      await getBrandSubtasks(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to delete subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Task-specific Subtask Operations
  const getTaskSubtasks = async (taskId: string): Promise<Subtask[]> => {
    try {
      setLoading(true);
      setError(null);
      // Get brand ID from current brand context
      const brandId = currentBrand?.id;
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      const response = await apiService.getTaskSubtasks(brandId, taskId);
      console.log('SubtaskContext - getTaskSubtasks response:', response);
      console.log('SubtaskContext - response.subtasks:', response.subtasks);
      console.log('SubtaskContext - response.data:', response.data);
      // Try different response structures
      if (response.subtasks) {
        return response.subtasks;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.log('SubtaskContext - unexpected response structure:', response);
        return [];
      }
    } catch (err: any) {
      console.error('Error fetching task subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch task subtasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assignment & Status Operations
  const assignSubtask = async (subtaskId: string, userId: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.assignSubtask(subtaskId, userId);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error assigning subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to assign subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unassignSubtask = async (subtaskId: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.unassignSubtask(subtaskId);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error unassigning subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to unassign subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateSubtaskStatus(subtaskId, status);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error updating subtask status:', err);
      setError(err?.message || err?.toString() || 'Failed to update subtask status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubtaskPriority = async (subtaskId: string, priority: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateSubtaskPriority(subtaskId, priority);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error updating subtask priority:', err);
      setError(err?.message || err?.toString() || 'Failed to update subtask priority');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Organization Operations
  const reorderSubtasks = async (subtaskIds: string[]): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const request: ReorderSubtasksRequest = { subtaskIds };
      await apiService.reorderSubtasks(request);
      await getBrandSubtasks(); // Refresh the list
    } catch (err: any) {
      console.error('Error reordering subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to reorder subtasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderTaskSubtasks = async (taskId: string, subtaskIds: string[]): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const request: ReorderSubtasksRequest = { subtaskIds };
      await apiService.reorderTaskSubtasks(taskId, request);
      await getBrandSubtasks(); // Refresh the list
    } catch (err: any) {
      console.error('Error reordering task subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to reorder task subtasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeSubtask = async (subtaskId: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.completeSubtask(subtaskId);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error completing subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to complete subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uncompleteSubtask = async (subtaskId: string): Promise<Subtask> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.uncompleteSubtask(subtaskId);
      await getBrandSubtasks(); // Refresh the list
      return response.subtask;
    } catch (err: any) {
      console.error('Error uncompleting subtask:', err);
      setError(err?.message || err?.toString() || 'Failed to uncomplete subtask');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Template Operations
  const getSubtaskTemplates = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSubtaskTemplates();
      setSubtaskTemplates(response.templates || []);
    } catch (err: any) {
      console.error('Error fetching subtask templates:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtask templates');
    } finally {
      setLoading(false);
    }
  };

  const getSubtaskTemplateById = async (templateId: string): Promise<SubtaskTemplate> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSubtaskTemplateById(templateId);
      return response.template;
    } catch (err: any) {
      console.error('Error fetching subtask template:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtask template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSubtaskTemplate = async (data: CreateSubtaskTemplateData): Promise<SubtaskTemplate> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createSubtaskTemplate(data);
      await getSubtaskTemplates(); // Refresh the list
      return response.template;
    } catch (err: any) {
      console.error('Error creating subtask template:', err);
      setError(err?.message || err?.toString() || 'Failed to create subtask template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubtaskTemplate = async (templateId: string, data: UpdateSubtaskTemplateData): Promise<SubtaskTemplate> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateSubtaskTemplate(templateId, data);
      await getSubtaskTemplates(); // Refresh the list
      return response.template;
    } catch (err: any) {
      console.error('Error updating subtask template:', err);
      setError(err?.message || err?.toString() || 'Failed to update subtask template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubtaskTemplate = async (templateId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteSubtaskTemplate(templateId);
      await getSubtaskTemplates(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting subtask template:', err);
      setError(err?.message || err?.toString() || 'Failed to delete subtask template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Template Application
  const applyTemplateToTask = async (data: ApplyTemplateRequest): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.applyTemplateToTask(data);
      await getBrandSubtasks(); // Refresh the list
    } catch (err: any) {
      console.error('Error applying template to task:', err);
      setError(err?.message || err?.toString() || 'Failed to apply template to task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Analytics Operations
  const getSubtaskAnalytics = async (): Promise<SubtaskAnalytics> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSubtaskAnalytics();
      return response.analytics;
    } catch (err: any) {
      console.error('Error fetching subtask analytics:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtask analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubtaskAnalyticsById = async (subtaskId: string): Promise<SubtaskAnalytics> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSubtaskAnalyticsById(subtaskId);
      return response.analytics;
    } catch (err: any) {
      console.error('Error fetching subtask analytics:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch subtask analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTaskSubtaskAnalytics = async (taskId: string): Promise<SubtaskAnalytics> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTaskSubtaskAnalytics(taskId);
      return response.analytics;
    } catch (err: any) {
      console.error('Error fetching task subtask analytics:', err);
      setError(err?.message || err?.toString() || 'Failed to fetch task subtask analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Search & Filtering Operations
  const searchSubtasks = async (query: string, filters?: SubtaskFilters): Promise<SubtaskSearchResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.searchSubtasks(query, filters);
      return response;
    } catch (err: any) {
      console.error('Error searching subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to search subtasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const filterSubtasks = async (filters: SubtaskFilters): Promise<SubtaskSearchResult> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.filterSubtasks(filters);
      return response;
    } catch (err: any) {
      console.error('Error filtering subtasks:', err);
      setError(err?.message || err?.toString() || 'Failed to filter subtasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: SubtaskContextType = {
    // State
    subtasks,
    subtaskTemplates,
    loading,
    error,

    // Subtask CRUD Operations
    getBrandSubtasks,
    createSubtask,
    getSubtaskById,
    updateSubtask,
    deleteSubtask,

    // Task-specific Subtask Operations
    getTaskSubtasks,

    // Assignment & Status Operations
    assignSubtask,
    unassignSubtask,
    updateSubtaskStatus,
    updateSubtaskPriority,

    // Organization Operations
    reorderSubtasks,
    reorderTaskSubtasks,
    completeSubtask,
    uncompleteSubtask,

    // Template Operations
    getSubtaskTemplates,
    getSubtaskTemplateById,
    createSubtaskTemplate,
    updateSubtaskTemplate,
    deleteSubtaskTemplate,

    // Template Application
    applyTemplateToTask,

    // Analytics Operations
    getSubtaskAnalytics,
    getSubtaskAnalyticsById,
    getTaskSubtaskAnalytics,

    // Search & Filtering Operations
    searchSubtasks,
    filterSubtasks,

    // Utility Functions
    clearError,
    refreshSubtasks,
  };

  return (
    <SubtaskContext.Provider value={contextValue}>
      {children}
    </SubtaskContext.Provider>
  );
};
