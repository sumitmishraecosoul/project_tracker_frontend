'use client';

import React, { useState } from 'react';
import { Activity, User } from '@/lib/comment-types';

interface ActivityFeedProps {
  activities: Activity[];
  currentUser: User;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, currentUser }) => {
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <i className="ri-add-circle-line text-blue-500"></i>;
      case 'completed':
        return <i className="ri-check-circle-line text-green-500"></i>;
      case 'commented':
        return <i className="ri-message-3-line text-purple-500"></i>;
      case 'assigned':
        return <i className="ri-user-add-line text-orange-500"></i>;
      case 'status_changed':
        return <i className="ri-refresh-line text-yellow-500"></i>;
      default:
        return <i className="ri-circle-line text-gray-500"></i>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'commented':
        return 'bg-purple-100 text-purple-800';
      case 'assigned':
        return 'bg-orange-100 text-orange-800';
      case 'status_changed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReaction = async (activityId: string, emoji: string) => {
    // TODO: API call to add reaction
    console.log('Adding reaction:', emoji, 'to activity:', activityId);
    setShowReactions(null);
  };

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          {/* Activity Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            {getActivityIcon(activity.type)}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            {/* User and Description */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-900">{activity.user.name}</span>
              <span className="text-sm text-gray-600">{activity.description}</span>
              <span className="text-sm text-gray-500">{formatRelativeTime(activity.createdAt)}</span>
            </div>

            {/* Activity Type Badge */}
            <div className="inline-block">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                {activity.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Metadata */}
            {activity.metadata && (activity.metadata.oldValue || activity.metadata.newValue) && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">
                  {activity.metadata.oldValue && (
                    <span className="line-through text-red-600 mr-2">
                      {activity.metadata.oldValue}
                    </span>
                  )}
                  {activity.metadata.newValue && (
                    <span className="text-green-600">
                      {activity.metadata.newValue}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center space-x-2 mt-2">
              {/* Existing Reactions */}
              {activity.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="text-sm hover:bg-gray-100 px-1 py-1 rounded"
                  onClick={() => handleReaction(activity.id, reaction.emoji)}
                >
                  {reaction.emoji}
                </button>
              ))}
              
              {/* Add Reaction Button */}
              <button
                onClick={() => setShowReactions(showReactions === activity.id ? null : activity.id)}
                className="text-sm text-gray-500 hover:text-gray-700 px-1 py-1 rounded hover:bg-gray-100"
              >
                <i className="ri-add-line"></i>
              </button>

              {/* Reaction Picker */}
              {showReactions === activity.id && (
                <div className="absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="flex items-center space-x-2">
                    {commonReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(activity.id, emoji)}
                        className="text-lg hover:bg-gray-100 p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="ri-time-line text-2xl"></i>
          </div>
          <p className="text-gray-500">No activity yet</p>
          <p className="text-sm text-gray-400">Activity will appear here as the task progresses</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

