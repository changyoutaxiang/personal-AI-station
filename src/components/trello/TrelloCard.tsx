'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckSquare,
  Square,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Edit3,
  Eye,
  Clock,
  Archive
} from 'lucide-react';
import { TrelloCard as TrelloCardType, LabelColor } from '@/types/trello';

interface TrelloCardProps {
  card: TrelloCardType;
  onUpdate: (cardId: string, updates: Partial<TrelloCardType>) => void;
  onDelete: (cardId: string) => void;
  onClick: (cardId: string) => void;
  isOverlay?: boolean;
}

export function TrelloCard({ card, onUpdate, onDelete, onClick, isOverlay = false }: TrelloCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getLabelColor = (color: LabelColor): string => {
    const colors: Record<LabelColor, string> = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      sky: 'bg-sky-500',
      lime: 'bg-lime-500',
      pink: 'bg-pink-500',
      black: 'bg-gray-800',
    };
    return colors[color];
  };

  const completedChecklist = card.checklist.filter(item => item.completed).length;
  const totalChecklist = card.checklist.length;
  const hasChecklist = totalChecklist > 0;
  const checklistProgress = hasChecklist ? (completedChecklist / totalChecklist) * 100 : 0;

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed;
  const isDueToday = card.dueDate &&
    new Date(card.dueDate).toDateString() === new Date().toDateString();

  const handleQuickComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(card.id, { completed: !card.completed });
  };

  const handleCardClick = () => {
    onClick(card.id);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white rounded-xl p-4 cursor-pointer
        hover:shadow-sm transition-all duration-200 group
        ${isDragging ? 'opacity-50 rotate-1 shadow-lg' : ''}
        ${isOverlay ? 'rotate-1 shadow-xl z-50' : ''}
        ${card.completed ? 'opacity-60' : ''}
        ${isOverdue ? 'border border-red-200 bg-red-50/50' : 'border border-gray-100'}
      `}
      onClick={handleCardClick}
    >
      {/* Cover Image/Color */}
      {card.cover && (
        <div className={`-m-3 mb-3 rounded-t-lg ${
          card.cover.size === 'full' ? 'h-32' : 'h-8'
        } ${card.cover.type === 'color' ? card.cover.value : ''}`}>
          {card.cover.type === 'image' && (
            <img
              src={card.cover.value}
              alt="Card cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
        </div>
      )}

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <div
              key={label.id}
              className={`h-2 rounded-full ${getLabelColor(label.color)}`}
              style={{ minWidth: label.name ? 'auto' : '40px', width: label.name ? 'auto' : '40px' }}
              title={label.name || label.color}
            >
              {label.name && (
                <span className="text-xs text-white px-2 py-1 rounded-full font-medium">
                  {label.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card Title */}
      <div className="mb-3">
        <h4 className={`text-base font-medium text-gray-900 leading-relaxed ${
          card.completed ? 'line-through text-gray-400' : ''
        }`}>
          {card.title}
        </h4>
      </div>

      {/* Card Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          {/* Due Date */}
          {card.dueDate && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              isOverdue ? 'bg-red-100 text-red-700' :
              isDueToday ? 'bg-yellow-100 text-yellow-700' :
              card.completed ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{new Date(card.dueDate).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
          )}

          {/* Checklist Progress */}
          {hasChecklist && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              checklistProgress === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <CheckSquare className="w-3 h-3" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </div>
          )}

          {/* Description Indicator */}
          {card.description && (
            <div className="flex items-center">
              <Eye className="w-3 h-3" />
            </div>
          )}

          {/* Comments Count */}
          {card.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{card.comments.length}</span>
            </div>
          )}

          {/* Attachments Count */}
          {card.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="w-3 h-3" />
              <span>{card.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Quick Actions (show on hover) */}
        <div className={`flex items-center space-x-1 transition-opacity duration-200 ${
          isHovered || isOverlay ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleQuickComplete}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={card.completed ? "标记为未完成" : "标记为完成"}
          >
            {card.completed ? (
              <CheckSquare className="w-4 h-4 text-green-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // 这里将触发编辑模式
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="快速编辑"
          >
            <Edit3 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Members */}
      {card.members.length > 0 && (
        <div className="flex items-center space-x-1 mt-2">
          {card.members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white"
              title={member.name}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{member.initials}</span>
              )}
            </div>
          ))}
          {card.members.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
              +{card.members.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Checklist Progress Bar */}
      {hasChecklist && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                checklistProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${checklistProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag Handle Visual Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 border-2 border-blue-300 rounded-lg opacity-50" />
      )}
    </motion.div>
  );
}