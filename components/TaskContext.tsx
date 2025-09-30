'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';
import { Task, CreateTaskData, UpdateTaskData, TaskAnalytics, TaskFilters, TaskSearchResult } from '../lib/types';

interface TaskContextType {
  // State
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  analytics: TaskAnalytics | null;
  
  // Actions
  getBrandTasks: (brandId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  getProjectTasks: (brandId: string, projectId: string) => Promise<void>;
  createTask: (brandId: string, taskData: CreateTaskData) => Promise<Task>;
  getTaskById: (brandId: string, taskId: string) => Promise<Task>;
  updateTask: (brandId: string, taskId: string, taskData: UpdateTaskData) => Promise<Task>;
  deleteTask: (brandId: string, taskId: string) => Promise<void>;
  assignTask: (brandId: string, taskId: string, assignedTo: string) => Promise<Task>;
  updateTaskStatus: (brandId: string, taskId: string, status: Task['status']) => Promise<Task>;
  updateTaskPriority: (brandId: string, taskId: string, priority: Task['priority']) => Promise<Task>;
  getTaskAnalytics: (brandId: string) => Promise<TaskAnalytics>;
  searchTasks: (brandId: string, query: string, params?: { page?: number; limit?: number }) => Promise<TaskSearchResult>;
  filterTasks: (brandId: string, filters: TaskFilters) => Promise<TaskSearchResult>;
  setCurrentTask: (task: Task | null) => void;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);

  const clearError = () => setError(null);

  const getBrandTasks = async (brandId: string, params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Getting brand tasks for:', brandId);
      const response = await apiService.getBrandTasks(brandId, params);
      console.log('TaskContext - Brand tasks response:', response);
      
      if (response.success && response.data) {
        const tasksData = response.data.tasks || [];
        setTasks(tasksData);
        console.log('TaskContext - Set tasks:', tasksData);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
      console.error('TaskContext - Error getting brand tasks:', error);
      setError(error?.message || error?.toString() || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getProjectTasks = async (brandId: string, projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Getting project tasks for:', { brandId, projectId });
      const response = await apiService.getProjectTasks(brandId, projectId);
      console.log('TaskContext - Project tasks response:', response);
      
      if (response.success && response.data) {
        const tasksData = response.data.tasks || [];
        console.log('TaskContext - Raw tasks data from API:', tasksData);
        console.log('TaskContext - First task dependencies:', tasksData[0]?.dependencies);
        console.log('TaskContext - First task keys:', tasksData[0] ? Object.keys(tasksData[0]) : 'No tasks');
        setTasks(tasksData);
        console.log('TaskContext - Set project tasks:', tasksData);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
      console.error('TaskContext - Error getting project tasks:', error);
      setError(error?.message || error?.toString() || 'Failed to load project tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (brandId: string, taskData: CreateTaskData): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Creating task:', { brandId, taskData });
      const response = await apiService.createBrandTask(brandId, taskData);
      console.log('TaskContext - Create task response:', response);
      
      if (response.success && response.data) {
        const newTask = response.data.task;
        setTasks(prev => [...prev, newTask]);
        console.log('TaskContext - Added new task to list:', newTask);
        return newTask;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      console.error('TaskContext - Error creating task:', error);
      setError(error?.message || error?.toString() || 'Failed to create task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTaskById = async (brandId: string, taskId: string): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Getting task by ID:', { brandId, taskId });
      const response = await apiService.getBrandTaskById(brandId, taskId);
      console.log('TaskContext - Get task by ID response:', response);
      
      if (response.success && response.data) {
        const task = response.data.task;
        setCurrentTask(task);
        return task;
      } else {
        throw new Error(response.message || 'Task not found');
      }
    } catch (error: any) {
      console.error('TaskContext - Error getting task by ID:', error);
      setError(error?.message || error?.toString() || 'Failed to get task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (brandId: string, taskId: string, taskData: UpdateTaskData): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Updating task:', { brandId, taskId, taskData });
      const response = await apiService.updateBrandTask(brandId, taskId, taskData);
      console.log('TaskContext - Update task response:', response);
      
      if (response.success && response.data) {
        const updatedTask = response.data.task;
        setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
        if (currentTask && currentTask._id === updatedTask._id) {
          setCurrentTask(updatedTask);
        }
        console.log('TaskContext - Updated task in list:', updatedTask);
        return updatedTask;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (error: any) {
      console.error('TaskContext - Error updating task:', error);
      setError(error?.message || error?.toString() || 'Failed to update task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (brandId: string, taskId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Deleting task:', { brandId, taskId });
      const response = await apiService.deleteBrandTask(brandId, taskId);
      console.log('TaskContext - Delete task response:', response);
      
      if (response.success) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
        if (currentTask && currentTask._id === taskId) {
          setCurrentTask(null);
        }
        console.log('TaskContext - Removed task from list:', taskId);
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (error: any) {
      console.error('TaskContext - Error deleting task:', error);
      setError(error?.message || error?.toString() || 'Failed to delete task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async (brandId: string, taskId: string, assignedTo: string): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Assigning task:', { brandId, taskId, assignedTo });
      const response = await apiService.assignBrandTask(brandId, taskId, assignedTo);
      console.log('TaskContext - Assign task response:', response);
      
      if (response.success && response.data) {
        const updatedTask = response.data.task;
        setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
        if (currentTask && currentTask._id === updatedTask._id) {
          setCurrentTask(updatedTask);
        }
        console.log('TaskContext - Updated task assignment:', updatedTask);
        return updatedTask;
      } else {
        throw new Error(response.message || 'Failed to assign task');
      }
    } catch (error: any) {
      console.error('TaskContext - Error assigning task:', error);
      setError(error?.message || error?.toString() || 'Failed to assign task');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (brandId: string, taskId: string, status: Task['status']): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Updating task status:', { brandId, taskId, status });
      const response = await apiService.updateBrandTaskStatus(brandId, taskId, status);
      console.log('TaskContext - Update task status response:', response);
      
      if (response.success && response.data) {
        const updatedTask = response.data.task;
        setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
        if (currentTask && currentTask._id === updatedTask._id) {
          setCurrentTask(updatedTask);
        }
        console.log('TaskContext - Updated task status:', updatedTask);
        return updatedTask;
      } else {
        throw new Error(response.message || 'Failed to update task status');
      }
    } catch (error: any) {
      console.error('TaskContext - Error updating task status:', error);
      setError(error?.message || error?.toString() || 'Failed to update task status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskPriority = async (brandId: string, taskId: string, priority: Task['priority']): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Updating task priority:', { brandId, taskId, priority });
      const response = await apiService.updateBrandTaskPriority(brandId, taskId, priority);
      console.log('TaskContext - Update task priority response:', response);
      
      if (response.success && response.data) {
        const updatedTask = response.data.task;
        setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
        if (currentTask && currentTask._id === updatedTask._id) {
          setCurrentTask(updatedTask);
        }
        console.log('TaskContext - Updated task priority:', updatedTask);
        return updatedTask;
      } else {
        throw new Error(response.message || 'Failed to update task priority');
      }
    } catch (error: any) {
      console.error('TaskContext - Error updating task priority:', error);
      setError(error?.message || error?.toString() || 'Failed to update task priority');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTaskAnalytics = async (brandId: string): Promise<TaskAnalytics> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Getting task analytics for:', brandId);
      const response = await apiService.getBrandTaskAnalytics(brandId);
      console.log('TaskContext - Task analytics response:', response);
      
      if (response.success && response.data) {
        const analyticsData = response.data;
        setAnalytics(analyticsData);
        console.log('TaskContext - Set analytics:', analyticsData);
        return analyticsData;
      } else {
        throw new Error(response.message || 'Failed to get task analytics');
      }
    } catch (error: any) {
      console.error('TaskContext - Error getting task analytics:', error);
      setError(error?.message || error?.toString() || 'Failed to get task analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchTasks = async (brandId: string, query: string, params?: { page?: number; limit?: number }): Promise<TaskSearchResult> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Searching tasks:', { brandId, query, params });
      const response = await apiService.searchBrandTasks(brandId, query, params);
      console.log('TaskContext - Search tasks response:', response);
      
      if (response.success && response.data) {
        const searchResult: TaskSearchResult = {
          tasks: response.data.tasks || [],
          total: response.data.total || 0,
          query: response.data.query || query
        };
        setTasks(searchResult.tasks);
        console.log('TaskContext - Set search results:', searchResult);
        return searchResult;
      } else {
        throw new Error(response.message || 'Failed to search tasks');
      }
    } catch (error: any) {
      console.error('TaskContext - Error searching tasks:', error);
      setError(error?.message || error?.toString() || 'Failed to search tasks');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = async (brandId: string, filters: TaskFilters): Promise<TaskSearchResult> => {
    setLoading(true);
    setError(null);
    try {
      console.log('TaskContext - Filtering tasks:', { brandId, filters });
      const response = await apiService.filterBrandTasks(brandId, filters);
      console.log('TaskContext - Filter tasks response:', response);
      
      if (response.success && response.data) {
        const filterResult: TaskSearchResult = {
          tasks: response.data.tasks || [],
          total: response.data.total || 0,
          filters: response.data.filters || filters
        };
        setTasks(filterResult.tasks);
        console.log('TaskContext - Set filter results:', filterResult);
        return filterResult;
      } else {
        throw new Error(response.message || 'Failed to filter tasks');
      }
    } catch (error: any) {
      console.error('TaskContext - Error filtering tasks:', error);
      setError(error?.message || error?.toString() || 'Failed to filter tasks');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: TaskContextType = {
    tasks,
    currentTask,
    loading,
    error,
    analytics,
    getBrandTasks,
    getProjectTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    updateTaskPriority,
    getTaskAnalytics,
    searchTasks,
    filterTasks,
    setCurrentTask,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
