'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MarkdownEditorProps } from '@/lib/comment-types';
import dynamic from 'next/dynamic';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Add a comment",
  onMention,
  showPreview = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPreviewMode, setShowPreviewMode] = useState(showPreview);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (val?: string) => {
    onChange(val || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle @ mentions
    if (e.key === '@') {
      // Trigger mention search
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      
      if (mentionMatch) {
        const query = mentionMatch[1];
        onMention(query).then(() => {
          // Mention suggestions will be handled by parent component
        });
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Custom toolbar configuration
  const toolbarCommands = [
    ['bold', 'italic', 'strikethrough'],
    ['title', 'quote', 'code'],
    ['link', 'image'],
    ['unorderedList', 'orderedList'],
    ['taskList']
  ];

  return (
    <div className="relative">
      <div className={`border rounded-md transition-colors ${
        isFocused 
          ? 'border-blue-500 ring-1 ring-blue-500' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <MDEditor
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          preview={showPreviewMode ? 'preview' : 'edit'}
          hideToolbar={false}
          toolbarHeight={40}
          data-color-mode="light"
          textareaProps={{
            placeholder: placeholder,
            style: {
              fontSize: '14px',
              lineHeight: '1.5',
              padding: '12px',
              minHeight: '80px',
              maxHeight: '200px',
              resize: 'vertical'
            }
          }}
        />
      </div>

      {/* Custom Preview Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowPreviewMode(!showPreviewMode)}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
        >
          {showPreviewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Mention Detection Indicator */}
      {value.includes('@') && (
        <div className="absolute bottom-1 left-1 text-xs text-blue-500">
          <i className="ri-at-line mr-1"></i>
          Mentions detected
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;

