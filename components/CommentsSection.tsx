'use client';

import React, { useState, useEffect } from 'react';
import { CommentsSectionProps, Comment, Activity, Notification } from '@/lib/comment-types';
import CommentInput from './CommentInput';
import CommentThread from './CommentThread';
import ActivityFeed from './ActivityFeed';
import NotificationCenter from './NotificationCenter';

const CommentsSection: React.FC<CommentsSectionProps> = ({
  taskId,
  brandId,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');

  // Mock data for development
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        taskId,
        projectId: 'proj1',
        brandId,
        content: 'This task looks good! Let me know if you need any help.',
        contentHtml: '<p>This task looks good! Let me know if you need any help.</p>',
        author: {
          id: 'user1',
          name: 'Sumit Mishra',
          email: 'sumit@example.com',
          avatar: 'SM',
          initials: 'SM'
        },
        mentions: [],
        links: [],
        reactions: [
          { userId: 'user2', emoji: '👍', createdAt: new Date() }
        ],
        replies: ['2'],
        replyCount: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isDeleted: false,
        editHistory: []
      },
      {
        id: '2',
        taskId,
        projectId: 'proj1',
        brandId,
        content: 'Thanks! I\'ll keep you updated on the progress.',
        contentHtml: '<p>Thanks! I\'ll keep you updated on the progress.</p>',
        author: {
          id: 'user2',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'JD',
          initials: 'JD'
        },
        mentions: [
          { userId: 'user1', name: 'Sumit Mishra', email: 'sumit@example.com', mentionedAt: new Date() }
        ],
        links: [],
        reactions: [],
        parentCommentId: '1',
        replies: [],
        replyCount: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isDeleted: false,
        editHistory: []
      }
    ];

    const mockActivities: Activity[] = [
      {
        id: 'act1',
        taskId,
        projectId: 'proj1',
        brandId,
        type: 'created',
        description: 'Sumit Mishra created this task',
        user: {
          id: 'user1',
          name: 'Sumit Mishra',
          email: 'sumit@example.com',
          avatar: 'SM',
          initials: 'SM'
        },
        metadata: {},
        reactions: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        id: 'act2',
        taskId,
        projectId: 'proj1',
        brandId,
        type: 'completed',
        description: 'Sumit Mishra marked this task complete',
        user: {
          id: 'user1',
          name: 'Sumit Mishra',
          email: 'sumit@example.com',
          avatar: 'SM',
          initials: 'SM'
        },
        metadata: {
          oldValue: 'In Progress',
          newValue: 'Completed'
        },
        reactions: [
          { userId: 'user2', emoji: '🎉', createdAt: new Date() }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'notif1',
        userId: currentUser.id,
        type: 'mention',
        title: 'You were mentioned in a comment',
        message: 'Sumit Mishra mentioned you in a comment',
        data: {
          taskId,
          commentId: '2',
          mentionedBy: 'user2'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        emailSent: true,
        emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    setComments(mockComments);
    setActivities(mockActivities);
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    setLoading(false);
  }, [taskId, brandId, currentUser.id]);

  const handleAddComment = async (commentData: any) => {
    try {
      // TODO: API call to add comment
      console.log('Adding comment:', commentData);
      
      // Mock new comment
      const newComment: Comment = {
        id: Date.now().toString(),
        taskId,
        projectId: 'proj1',
        brandId,
        content: commentData.content,
        contentHtml: `<p>${commentData.content}</p>`,
        author: currentUser,
        mentions: commentData.mentions || [],
        links: commentData.links || [],
        reactions: [],
        replies: [],
        replyCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        editHistory: []
      };

      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      setError('Failed to add comment');
    }
  };

  const handleAddReply = async (replyData: any, parentId: string) => {
    try {
      // TODO: API call to add reply
      console.log('Adding reply:', replyData, 'to parent:', parentId);
      
      // Mock new reply
      const newReply: Comment = {
        id: Date.now().toString(),
        taskId,
        projectId: 'proj1',
        brandId,
        content: replyData.content,
        contentHtml: `<p>${replyData.content}</p>`,
        author: currentUser,
        mentions: replyData.mentions || [],
        links: replyData.links || [],
        reactions: [],
        parentCommentId: parentId,
        replies: [],
        replyCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        editHistory: []
      };

      setComments(prev => {
        const updated = [...prev];
        const parentIndex = updated.findIndex(c => c.id === parentId);
        if (parentIndex !== -1) {
          updated[parentIndex].replies.push(newReply.id);
          updated[parentIndex].replyCount += 1;
        }
        return [newReply, ...updated];
      });
    } catch (error) {
      setError('Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      // TODO: API call to edit comment
      console.log('Editing comment:', commentId, content);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              content, 
              contentHtml: `<p>${content}</p>`,
              editedAt: new Date(),
              updatedAt: new Date()
            }
          : comment
      ));
    } catch (error) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // TODO: API call to delete comment
      console.log('Deleting comment:', commentId);
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              isDeleted: true,
              deletedAt: new Date(),
              deletedBy: currentUser.id
            }
          : comment
      ));
    } catch (error) {
      setError('Failed to delete comment');
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      // TODO: API call to add reaction
      console.log('Adding reaction:', emoji, 'to comment:', commentId);
      
      const newReaction = {
        userId: currentUser.id,
        emoji,
        createdAt: new Date()
      };

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              reactions: [...comment.reactions, newReaction]
            }
          : comment
      ));
    } catch (error) {
      setError('Failed to add reaction');
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleThread = (commentId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getTopLevelComments = () => {
    return comments.filter(comment => !comment.parentCommentId && !comment.isDeleted);
  };

  const getRepliesForComment = (commentId: string) => {
    return comments.filter(comment => comment.parentCommentId === commentId && !comment.isDeleted);
  };

  const sortedComments = getTopLevelComments().sort((a, b) => 
    sortOrder === 'oldest' 
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime()
  );

  const sortedActivities = activities.sort((a, b) => 
    sortOrder === 'oldest' 
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 rounded-lg border border-gray-200">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('comments')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All activity
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'oldest' ? 'newest' : 'oldest')}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <i className="ri-arrow-up-down-line"></i>
              <span>{sortOrder === 'oldest' ? 'Oldest' : 'Newest'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'comments' ? (
          <div className="space-y-4">
            {/* Activity Feed */}
            <div className="space-y-3 mb-6">
              {sortedActivities.slice(0, 2).map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {/* Activity Icon */}
                  <div className="flex-shrink-0">
                    {activity.type === 'created' ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SM</span>
                      </div>
                    ) : activity.type === 'completed' ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <i className="ri-circle-line text-white text-sm"></i>
                      </div>
                    )}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{activity.description}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                        <button className="p-1 text-gray-500 hover:text-gray-700">
                          <i className="ri-emotion-line text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <CommentInput
              onSubmit={handleAddComment}
              placeholder="Add a comment"
            />

            {/* Comments List */}
            <div className="space-y-4">
              {sortedComments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  replies={getRepliesForComment(comment.id)}
                  onReply={handleAddReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReaction={handleReaction}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        ) : (
          <ActivityFeed
            activities={sortedActivities}
            currentUser={currentUser}
          />
        )}
      </div>


      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
