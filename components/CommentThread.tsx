'use client';

import React, { useState } from 'react';
import { CommentThreadProps, Comment } from '@/lib/comment-types';
import CommentInput from './CommentInput';
import ReactMarkdown from 'react-markdown';

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  currentUser
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  const handleReaction = async (emoji: string) => {
    await onReaction(comment.id, emoji);
    setShowReactions(false);
  };

  const canEdit = currentUser.id === comment.author.id;
  const canDelete = currentUser.id === comment.author.id;

  const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          comment.author.id === currentUser.id ? 'bg-blue-500' : 'bg-gray-600'
        }`}>
          {comment.author.initials}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Author and Time */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-white">{comment.author.name}</span>
            <span className="text-sm text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
            {comment.editedAt && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-invert">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
          )}

          {/* Mentions */}
          {comment.mentions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.mentions.map((mention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  @{mention.name}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {comment.links.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.links.map((link, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <i className="ri-link text-gray-400"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        {link.title}
                      </a>
                      <div className="text-xs text-gray-400 mt-1">
                        {link.preview.domain}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4 mt-2">
              {/* Reactions */}
              <div className="flex items-center space-x-1">
                {comment.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className="text-sm hover:bg-gray-100 px-1 py-1 rounded"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {reaction.emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-1 py-1 rounded hover:bg-gray-100"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>

              {/* Reply */}
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Reply
              </button>

              {/* Edit */}
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Edit
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className="mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-sm">
              <div className="flex items-center space-x-2">
                {commonReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
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

      {/* Reply Input */}
      {isReplying && (
        <div className="ml-11">
          <CommentInput
            onSubmit={(replyData) => {
              onReply(replyData, comment.id);
              setIsReplying(false);
            }}
            onReply={onReply}
            parentCommentId={comment.id}
            placeholder="Write a reply..."
            isReply={true}
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-3">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
