'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface SearchHighlighterProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

export const SearchHighlighter: React.FC<SearchHighlighterProps> = ({
  text,
  searchTerm,
  className = 'text-text-primary',
  highlightClassName = 'bg-color-primary/20 text-color-primary font-medium px-1 rounded'
}) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

interface SearchResultItemProps {
  todo: {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    project_tag?: string;
  };
  searchTerm: string;
  onClick: () => void;
  isSelected: boolean;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  todo,
  searchTerm,
  onClick,
  isSelected
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-warning';
      default: return 'text-text-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 glassmorphism-card hover:bg-background-subtle transition-colors ${
        isSelected ? 'ring-2 ring-color-primary' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <SearchHighlighter
            text={todo.title}
            searchTerm={searchTerm}
            className="text-sm font-medium block truncate"
          />
          
          {todo.description && (
            <SearchHighlighter
              text={todo.description}
              searchTerm={searchTerm}
              className="text-xs text-text-muted mt-1 block truncate"
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(todo.status)}`}
          >
            {todo.status === 'completed' ? '完成' : todo.status === 'in_progress' ? '进行中' : '待办'}
          </span>
          
          <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(todo.priority)}`}
          >
            {todo.priority}
          </span>
        </div>
      </div>
      
      <div className="flex items-center mt-2 text-xs text-text-muted">
        <Tag className="w-3 h-3 mr-1" />
        <span>{todo.project_tag || '其他'}</span>
      </div>
    </button>
  );
};