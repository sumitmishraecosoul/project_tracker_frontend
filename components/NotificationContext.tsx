'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api-service';

interface Notification {
  id: string;
  type: 'comment_mentioned' | 'comment_replied' | 'task_assigned' | 'task_comment_mentioned' | 'project_team_member_added' | 'task_subtask_added' | 'brand_invitation' | 'task_updated' | 'project_updated';
  title: string;
  message: string;
  entity_type: 'project' | 'task' | 'subtask' | 'comment' | 'brand';
  entity_id: string;
  entity_name: string;
  from_user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  to_user: {
    id: string;
    name: string;
    email: string;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    project_id?: string;
    task_id?: string;
    subtask_id?: string;
    comment_id?: string;
    brand_id?: string;
    role?: string;
    status?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  getNotifications: (brandId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) => Promise<void>;
  markAsRead: (brandId: string, notificationId: string) => Promise<void>;
  markAllAsRead: (brandId: string) => Promise<void>;
  deleteNotification: (brandId: string, notificationId: string) => Promise<void>;
  refreshNotifications: (brandId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotifications = async (brandId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('NotificationContext - Fetching notifications for brand:', brandId, 'with params:', params);
      const response = await apiService.getUserNotifications(brandId, params);
      console.log('NotificationContext - API response:', response);
      console.log('NotificationContext - Response data type:', typeof response.data);
      console.log('NotificationContext - Response data is array:', Array.isArray(response.data));
      console.log('NotificationContext - Response data structure:', response.data);
      
      if (response.success) {
        // Handle different API response structures
        let notificationData = response.data || [];
        
        // If response.data is an object with notifications array
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          notificationData = response.data.notifications || response.data.data || [];
        }
        
        // Ensure it's an array
        if (!Array.isArray(notificationData)) {
          console.warn('NotificationContext - API response is not an array:', notificationData);
          notificationData = [];
        }
        
        console.log('NotificationContext - Setting notifications:', notificationData);
        setNotifications(notificationData);
      } else {
        console.error('NotificationContext - API error:', response.message);
        setError(response.message || 'Failed to load notifications');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load notifications';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (brandId: string, notificationId: string) => {
    try {
      setError(null);
      console.log('NotificationContext - Marking notification as read:', notificationId);
      const response = await apiService.markNotificationAsRead(brandId, notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        console.log('NotificationContext - Notification marked as read');
      } else {
        setError(response.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to mark notification as read';
      setError(errorMessage);
      throw error;
    }
  };

  const markAllAsRead = async (brandId: string) => {
    try {
      setError(null);
      console.log('NotificationContext - Marking all notifications as read');
      const response = await apiService.markAllNotificationsAsRead(brandId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        console.log('NotificationContext - All notifications marked as read');
      } else {
        setError(response.message || 'Failed to mark all notifications as read');
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to mark all notifications as read';
      setError(errorMessage);
      throw error;
    }
  };

  const deleteNotification = async (brandId: string, notificationId: string) => {
    try {
      setError(null);
      console.log('NotificationContext - Deleting notification:', notificationId);
      const response = await apiService.deleteNotification(brandId, notificationId);
      
      if (response.success) {
        // Remove from local state
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        console.log('NotificationContext - Notification deleted');
      } else {
        setError(response.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to delete notification';
      setError(errorMessage);
      throw error;
    }
  };

  const refreshNotifications = async (brandId: string) => {
    await getNotifications(brandId);
  };

  // Calculate unread count with safety check
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(notification => !notification.is_read).length 
    : 0;

  // Load notifications when brand changes
  useEffect(() => {
    // This will be called from components that have access to currentBrand
    // The actual loading will be triggered by the Inbox component
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
