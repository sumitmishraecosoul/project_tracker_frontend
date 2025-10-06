'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface DynamicCommentsSectionProps {
  taskId: string;
  currentUser: any;
}

export default function DynamicCommentsSection({ taskId, currentUser }: DynamicCommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(false);

  // Load comments when component mounts or taskId changes
  useEffect(() => {
    if (taskId && currentUser?.id) {
      loadComments();
    }
  }, [taskId, currentUser?.id]);

  // Load comments function
  const loadComments = async () => {
    try {
      setLoading(true);
      console.log('Loading comments for task:', taskId, 'user:', currentUser.id);
      
      // Try to get comments with entity filter first
      let response;
      try {
        response = await apiService.getBrandComments(currentUser.id, { 
          entity_type: 'task', 
          entity_id: taskId 
        });
        console.log('Filtered comments response:', response);
      } catch (filterError) {
        console.log('Filtered comments failed, trying all comments:', filterError);
        // Fallback to get all comments and filter manually
        response = await apiService.getBrandComments(currentUser.id);
        console.log('All comments response:', response);
      }
      
      const commentsData = response.data || response || [];
      console.log('Raw comments data:', commentsData);
      
      let commentsArray = [];
      if (Array.isArray(commentsData)) {
        commentsArray = commentsData;
      } else if (commentsData.comments && Array.isArray(commentsData.comments)) {
        commentsArray = commentsData.comments;
      } else if (commentsData.data && Array.isArray(commentsData.data)) {
        commentsArray = commentsData.data;
      }
      
      // If we got all comments, filter by task ID manually
      if (commentsArray.length > 0 && commentsArray[0].entity_id) {
        commentsArray = commentsArray.filter((comment: any) => comment.entity_id === taskId);
      }
      
      console.log('Final comments array:', commentsArray);
      setComments(commentsArray);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !taskId || !currentUser?.id || isAddingComment) return;
    
    try {
      setIsAddingComment(true);
      
      const commentData = {
        content: newComment.trim(),
        entity_type: 'task',
        entity_id: taskId
      };
      
      const response = await apiService.createBrandComment(currentUser.id, commentData);
      console.log('Comment created successfully:', response);
      setNewComment('');
      
      // Refresh comments
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await apiService.deleteBrandComment(currentUser.id, commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Error deleting comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content);
  };

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || !editingCommentText.trim() || !currentUser?.id) return;
    
    try {
      setIsEditingComment(true);
      
      const updateData = {
        content: editingCommentText.trim()
      };
      
      await apiService.updateBrandComment(currentUser.id, editingCommentId, updateData);
      
      // Reset editing state
      setEditingCommentId(null);
      setEditingCommentText('');
      
      // Refresh comments
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(`Error updating comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEditingComment(false);
    }
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      console.log('Formatting date:', { dateString, date, diffInMinutes, diffInHours, diffInDays });
      
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">Comments</label>
        <span className="text-sm text-gray-500">{comments.length} comments</span>
      </div>
      
      {/* Add Comment */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Write a comment..."
              disabled={isAddingComment}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Press Ctrl+Enter to save</span>
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isAddingComment ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-xs"></i>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-add-line text-xs"></i>
                    <span>Add Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          Loading comments...
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mt-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author?.name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at || comment.createdAt)}
                  </span>
                </div>
                
                {/* Edit Comment Form */}
                {editingCommentId === comment._id ? (
                  <div className="mb-2">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      placeholder="Edit your comment..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={handleCancelCommentEdit}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCommentEdit}
                        disabled={!editingCommentText.trim() || isEditingComment}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {isEditingComment ? (
                          <>
                            <i className="ri-loader-4-line animate-spin text-xs"></i>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-check-line text-xs"></i>
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal Comment Display */
                  <>
                    <div className="text-sm text-gray-700 mb-2">
                      {comment.content}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Reply
                      </button>
                      <button 
                        onClick={() => handleEditComment(comment)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          No comments yet
        </div>
      )}
    </div>
  );
}