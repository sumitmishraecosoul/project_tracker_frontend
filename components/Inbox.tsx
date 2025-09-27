'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { useBrand } from './BrandContext';

interface InboxProps {
  onClose?: () => void;
}

export default function Inbox({ onClose }: InboxProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications 
  } = useNotifications();
  
  const { currentBrand } = useBrand();
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions' | 'assignments'>('all');
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (currentBrand?.id) {
      refreshNotifications(currentBrand.id);
    }
  }, [currentBrand?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!currentBrand?.id) return;
    try {
      await markAsRead(currentBrand.id, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentBrand?.id) return;
    try {
      await markAllAsRead(currentBrand.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!currentBrand?.id) return;
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(currentBrand.id, notificationId);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_mentioned':
      case 'comment_replied':
        return 'ri-at-line';
      case 'task_assigned':
      case 'task_comment_mentioned':
        return 'ri-user-add-line';
      case 'project_team_member_added':
        return 'ri-folder-line';
      case 'task_subtask_added':
        return 'ri-list-check';
      case 'brand_invitation':
        return 'ri-mail-line';
      case 'task_updated':
        return 'ri-checkbox-line';
      case 'project_updated':
        return 'ri-folder-line';
      default:
        return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'comment_mentioned':
      case 'comment_replied':
        return 'text-blue-500';
      case 'task_assigned':
      case 'task_comment_mentioned':
        return 'text-green-500';
      case 'project_team_member_added':
        return 'text-orange-500';
      case 'task_subtask_added':
        return 'text-cyan-500';
      case 'brand_invitation':
        return 'text-purple-500';
      case 'task_updated':
        return 'text-indigo-500';
      case 'project_updated':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = Array.isArray(notifications) ? notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'mentions':
        return notification.type === 'comment_mentioned' || notification.type === 'comment_replied' || notification.type === 'task_comment_mentioned';
      case 'assignments':
        return notification.type === 'task_assigned' || notification.type === 'project_team_member_added' || notification.type === 'task_subtask_added';
      default:
        return true;
    }
  }) : [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
            <span className="text-gray-600">Loading notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: Array.isArray(notifications) ? notifications.length : 0 },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'mentions', label: 'Mentions', count: Array.isArray(notifications) ? notifications.filter(n => n.type === 'comment_mentioned' || n.type === 'comment_replied' || n.type === 'task_comment_mentioned').length : 0 },
          { key: 'assignments', label: 'Assignments', count: Array.isArray(notifications) ? notifications.filter(n => n.type === 'task_assigned' || n.type === 'project_team_member_added' || n.type === 'task_subtask_added').length : 0 }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => currentBrand?.id && refreshNotifications(currentBrand.id)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <i className="ri-refresh-line mr-1"></i>
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              <i className="ri-check-line mr-1"></i>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-notification-off-line text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'Notifications will appear here when you\'re mentioned or assigned to tasks.'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                !notification.is_read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <i className={`${getNotificationIcon(notification.type)} ${getNotificationColor(notification.type)} text-lg`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.created_at)}
                      </span>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>From: {notification.sender.name}</span>
                      <span>•</span>
                      <span>{notification.entity_type}: {notification.entity_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Mark as read"
                        >
                          <i className="ri-check-line"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete notification"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
