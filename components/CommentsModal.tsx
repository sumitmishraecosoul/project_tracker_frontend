'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';

interface Comment {
  _id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  entity_type: string;
  entity_id: string;
  parent_comment?: string;
  mentions?: string[];
  attachments?: any[];
  reactions?: any[];
}

interface CommentsModalProps {
  isOpen: boolean;
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentsModal({
  isOpen,
  taskId,
  taskTitle,
  onClose,
  onCommentCountChange
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const brand = localStorage.getItem('currentBrand');
      if (brand) {
        setCurrentBrand(JSON.parse(brand));
      }
      fetchComments();
    }
  }, [isOpen, taskId]);

  const fetchComments = async () => {
    if (!currentBrand || !taskId) return;

    try {
      setLoading(true);
      setError('');

      const data = await apiService.getBrandComments(currentBrand._id, {
        entity_type: 'tasks',
        entity_id: taskId,
        limit: 100
      });

      const commentsArray = Array.isArray(data) ? data : [];
      setComments(commentsArray);

      // Notify parent component of comment count
      if (onCommentCountChange) {
        onCommentCountChange(commentsArray.length);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentBrand || !taskId) return;

    try {
      setSubmitting(true);
      setError('');

      await apiService.createBrandComment(currentBrand._id, {
        content: newComment.trim(),
        entity_type: 'tasks',
        entity_id: taskId
      });

      setNewComment('');
      await fetchComments(); // Refresh comments list
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-600 mt-1">{taskTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line w-6 h-6"></i>
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="ri-chat-1-line w-12 h-12 mx-auto mb-4 text-gray-300"></i>
              <p>No comments yet</p>
              <p className="text-sm">Be the first to add a comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={submitting}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
