'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommentInputProps, MentionSuggestion } from '@/lib/comment-types';
import MarkdownEditor from './MarkdownEditor';

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  onReply,
  parentCommentId,
  placeholder = "Add a comment",
  isReply = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentions, setMentions] = useState<MentionSuggestion[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Mock mention suggestions
  const mockMentionSuggestions: MentionSuggestion[] = [
    {
      id: 'user1',
      type: 'user',
      name: 'Sumit Mishra',
      email: 'sumitmishraecosoul@gmail.com',
      avatar: 'SM',
      color: 'bg-blue-500'
    },
    {
      id: 'user2',
      type: 'user',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'JD',
      color: 'bg-green-500'
    },
    {
      id: 'user3',
      type: 'user',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'JS',
      color: 'bg-purple-500'
    },
    {
      id: 'proj1',
      type: 'project',
      name: 'Website Redesign',
      avatar: 'WR',
      color: 'bg-orange-500'
    },
    {
      id: 'task1',
      type: 'task',
      name: 'Update Homepage',
      avatar: 'UH',
      color: 'bg-red-500'
    }
  ];

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        content: content.trim(),
        mentions: mentions.map(mention => ({
          userId: mention.id,
          name: mention.name,
          email: mention.email || '',
          mentionedAt: new Date()
        })),
        links
      };

      if (isReply && onReply && parentCommentId) {
        await onReply(commentData, parentCommentId);
      } else {
        await onSubmit(commentData);
      }

      // Reset form
      setContent('');
      setMentions([]);
      setLinks([]);
      setShowFormattingToolbar(false);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMentionSearch = async (query: string): Promise<MentionSuggestion[]> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockMentionSuggestions.filter(suggestion =>
          suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
          suggestion.email?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      }, 300);
    });
  };

  const handleMentionSelect = (suggestion: MentionSuggestion) => {
    const beforeCursor = content.substring(0, textareaRef.current?.selectionStart || 0);
    const afterCursor = content.substring(textareaRef.current?.selectionEnd || 0);
    const beforeMention = beforeCursor.substring(0, beforeCursor.lastIndexOf('@'));
    const newContent = `${beforeMention}@${suggestion.name} ${afterCursor}`;
    
    setContent(newContent);
    setMentions(prev => [...prev, suggestion]);
    setShowMentionDropdown(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Check for @ mentions
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentionDropdown(true);
      
      // Position dropdown
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.bottom + 5,
          left: rect.left
        });
      }
      
      // Search for suggestions
      handleMentionSearch(query).then(setMentionSuggestions);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  };

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundLinks = text.match(urlRegex) || [];
    
    const linkObjects = foundLinks.map(url => ({
      url,
      title: url,
      description: '',
      type: url.includes('onedrive') ? 'onedrive' : 
             url.includes('googledrive') ? 'googledrive' : 'external',
      preview: {
        image: '',
        domain: new URL(url).hostname
      }
    }));
    
    setLinks(linkObjects);
  };

  useEffect(() => {
    extractLinks(content);
  }, [content]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      {/* User Avatar and Input */}
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          SM
        </div>
        
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          
          {/* Mention Dropdown */}
          {showMentionDropdown && (
            <div
              ref={mentionDropdownRef}
              className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              style={{
                top: mentionPosition.top,
                left: mentionPosition.left,
                minWidth: '300px'
              }}
            >
              <div className="py-1">
                {mentionSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleMentionSelect(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 text-gray-900"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${suggestion.color}`}>
                      {suggestion.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white">{suggestion.name}</div>
                      {suggestion.email && (
                        <div className="text-gray-400 text-xs">{suggestion.email}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formatting Toolbar - Always visible like Asana */}
      <div className="flex items-center space-x-2 text-gray-400">
        <button className="p-1 hover:bg-gray-100 rounded" title="Add content">
          <i className="ri-add-line text-sm"></i>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Text formatting">
          <i className="ri-text text-sm"></i>
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded" 
          title="Emojis"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <i className="ri-emotion-line text-sm"></i>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Mention">
          <i className="ri-at-line text-sm"></i>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Star">
          <i className="ri-star-line text-sm"></i>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Attach">
          <i className="ri-attachment-line text-sm"></i>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded" title="Magic">
          <i className="ri-magic-line text-sm"></i>
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>0 people will be notified</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="text-xs text-gray-400">
        Press Cmd+Enter to submit
      </div>
    </div>
  );
};

export default CommentInput;
