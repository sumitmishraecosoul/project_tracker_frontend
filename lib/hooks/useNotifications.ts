'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/lib/comment-types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif1',
        userId: 'user1',
        type: 'mention',
        title: 'You were mentioned in a comment',
        message: 'Sumit Mishra mentioned you in a comment',
        data: {
          taskId: 'task1',
          commentId: 'comment1',
          mentionedBy: 'user2'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        emailSent: true,
        emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'notif2',
        userId: 'user1',
        type: 'comment',
        title: 'New comment on task',
        message: 'John Doe commented on "Update Homepage"',
        data: {
          taskId: 'task1',
          commentId: 'comment2'
        },
        isRead: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        emailSent: true,
        emailSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    setLoading(false);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: API call to mark notification as read
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { 
              ...notification, 
              isRead: true,
              readAt: new Date()
            }
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      setError('Failed to mark notification as read');
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: API call to mark all notifications as read
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date()
      })));
      
      setUnreadCount(0);
    } catch (error) {
      setError('Failed to mark all notifications as read');
      throw error;
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const filtered = prev.filter(n => n.id !== notificationId);
      
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return filtered;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };
};

