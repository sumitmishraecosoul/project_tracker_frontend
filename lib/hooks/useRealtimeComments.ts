'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, Activity, CommentData } from '@/lib/comment-types';

interface UseRealtimeCommentsProps {
  taskId: string;
  brandId: string;
  currentUser: any;
}

export const useRealtimeComments = ({ taskId, brandId, currentUser }: UseRealtimeCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    setComments(mockComments);
    setActivities(mockActivities);
    setLoading(false);
    setIsConnected(true); // Mock connection
  }, [taskId, brandId]);

  const addComment = useCallback(async (commentData: CommentData) => {
    try {
      // TODO: API call to add comment
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
      
      // Create activity
      const newActivity: Activity = {
        id: `act_${Date.now()}`,
        taskId,
        projectId: 'proj1',
        brandId,
        type: 'commented',
        description: `${currentUser.name} commented`,
        user: currentUser,
        metadata: {},
        reactions: [],
        createdAt: new Date()
      };

      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      setError('Failed to add comment');
      throw error;
    }
  }, [taskId, brandId, currentUser]);

  const addReply = useCallback(async (replyData: CommentData, parentId: string) => {
    try {
      // TODO: API call to add reply
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
      throw error;
    }
  }, [taskId, brandId, currentUser]);

  const editComment = useCallback(async (commentId: string, content: string) => {
    try {
      // TODO: API call to edit comment
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
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      // TODO: API call to delete comment
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
      throw error;
    }
  }, [currentUser.id]);

  const addReaction = useCallback(async (commentId: string, emoji: string) => {
    try {
      // TODO: API call to add reaction
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
      throw error;
    }
  }, [currentUser.id]);

  const addActivityReaction = useCallback(async (activityId: string, emoji: string) => {
    try {
      // TODO: API call to add activity reaction
      const newReaction = {
        userId: currentUser.id,
        emoji,
        createdAt: new Date()
      };

      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              reactions: [...activity.reactions, newReaction]
            }
          : activity
      ));
    } catch (error) {
      setError('Failed to add reaction');
      throw error;
    }
  }, [currentUser.id]);

  return {
    comments,
    activities,
    loading,
    error,
    isConnected,
    addComment,
    addReply,
    editComment,
    deleteComment,
    addReaction,
    addActivityReaction
  };
};

