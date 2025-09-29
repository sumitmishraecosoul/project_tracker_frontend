'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

// Utility functions for URL detection and copy functionality
const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

const renderTextWithLinks = (text: string) => {
  const urls = detectUrls(text);
  if (urls.length === 0) {
    return <span>{text}</span>;
  }

  let parts = [text];
  urls.forEach(url => {
    const newParts: (string | JSX.Element)[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const urlIndex = part.indexOf(url);
        if (urlIndex !== -1) {
          newParts.push(part.substring(0, urlIndex));
          newParts.push(
            <span key={url} className="inline-flex items-center space-x-1">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {url}
              </a>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const success = await copyToClipboard(url);
                  if (success) {
                    console.log('URL copied to clipboard:', url);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                title="Copy URL"
              >
                <i className="ri-file-copy-line text-xs"></i>
              </button>
            </span>
          );
          newParts.push(part.substring(urlIndex + url.length));
        } else {
          newParts.push(part);
        }
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <span>{parts}</span>;
};

interface DynamicCommentsSectionProps {
  taskId: string;
  brandId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    initials: string;
  };
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  reactions?: Array<{
    user: string;
    emoji: string;
  }>;
  parent_id?: string;
}

const DynamicCommentsSection: React.FC<DynamicCommentsSectionProps> = ({
  taskId,
  brandId,
  currentUser
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load comments from API
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('DynamicCommentsSection - Loading comments for:', { taskId, brandId });

        const response = await apiService.getBrandComments(brandId, {
          entity_type: 'task',
          entity_id: taskId,
          status: 'active',
          limit: 50
        });

        if (response.success) {
          const comments = response.data.comments || [];
          console.log('DynamicCommentsSection - Loaded comments:', comments);
          console.log('DynamicCommentsSection - First comment structure:', comments[0]);
          if (comments[0]) {
            console.log('DynamicCommentsSection - First comment date fields:', {
              created_at: comments[0].created_at,
              updated_at: comments[0].updated_at,
              createdAt: comments[0].createdAt,
              updatedAt: comments[0].updatedAt,
              date: comments[0].date,
              timestamp: comments[0].timestamp
            });
          }
          setComments(comments);
        } else {
          console.error('Failed to load comments:', response.message);
          setComments([]);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        setError('Failed to load comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    if (taskId && brandId) {
      loadComments();
    }
  }, [taskId, brandId]);

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || saving) return;

    try {
      setSaving(true);
      setError(null);
      
      console.log('DynamicCommentsSection - Adding comment with:', { brandId, taskId, newComment: newComment.trim() });

      const response = await apiService.createBrandComment(brandId, {
        content: newComment.trim(),
        entity_type: 'task',
        entity_id: taskId
      });

      if (response.success) {
        setNewComment('');
        // Reload comments to show the new one
        const updatedResponse = await apiService.getBrandComments(brandId, {
          entity_type: 'task',
          entity_id: taskId,
          status: 'active',
          limit: 50
        });
        
        if (updatedResponse.success) {
          setComments(updatedResponse.data.comments || []);
        }
      } else {
        setError('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSaving(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setSaving(true);
      setError(null);

      const response = await apiService.deleteBrandComment(brandId, commentId);

      if (response.success) {
        // Remove comment from local state
        setComments(comments.filter(comment => comment._id !== commentId));
      } else {
        setError('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    } finally {
      setSaving(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      setSaving(true);
      setError(null);

      const response = await apiService.updateBrandComment(brandId, commentId, {
        content: newContent
      });

      if (response.success) {
        // Update comment in local state
        setComments(comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, content: newContent, updated_at: new Date().toISOString() }
            : comment
        ));
      } else {
        setError('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  // Add reaction
  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const response = await apiService.addCommentReaction(brandId, commentId, emoji);
      
      if (response.success) {
        // Reload comments to show updated reactions
        const updatedResponse = await apiService.getBrandComments(brandId, {
          entity_type: 'task',
          entity_id: taskId,
          status: 'active',
          limit: 50
        });
        
        if (updatedResponse.success) {
          setComments(updatedResponse.data.comments || []);
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        <span className="text-sm text-gray-500">{comments.length} comments</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Add Comment Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {currentUser.initials || currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={saving}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Press Ctrl+Enter to save</span>
              </div>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="ri-chat-3-line text-2xl mb-2"></i>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        // Try different possible date field names
                        const dateValue = comment.created_at || comment.createdAt || comment.date || comment.timestamp;
                        console.log('DynamicCommentsSection - Date formatting for comment:', comment._id, 'dateValue:', dateValue);
                        
                        if (!dateValue) {
                          console.warn('DynamicCommentsSection - No date field found for comment:', comment);
                          return 'Unknown date';
                        }
                        
                        try {
                          const date = new Date(dateValue);
                          if (isNaN(date.getTime())) {
                            console.warn('DynamicCommentsSection - Invalid date value:', dateValue);
                            return 'Invalid date';
                          }
                          return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
                        } catch (error) {
                          console.error('DynamicCommentsSection - Error formatting date:', error, 'dateValue:', dateValue);
                          return 'Invalid date';
                        }
                      })()}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  <div className="text-gray-700 mb-2">
                    {renderTextWithLinks(comment.content)}
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          const success = await copyToClipboard(comment.content);
                          if (success) {
                            // You could add a toast notification here
                            console.log('Comment copied to clipboard');
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy comment"
                      >
                        <i className="ri-file-copy-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleAddReaction(comment._id, '👍')}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Like"
                      >
                        <i className="ri-thumb-up-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleAddReaction(comment._id, '❤️')}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Love"
                      >
                        <i className="ri-heart-line text-sm"></i>
                      </button>
                    </div>
                    
                    {comment.author._id === currentUser.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newContent = prompt('Edit comment:', comment.content);
                            if (newContent && newContent !== comment.content) {
                              handleEditComment(comment._id, newContent);
                            }
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors text-sm"
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DynamicCommentsSection;
