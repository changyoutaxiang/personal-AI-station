'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit2,
  Save,
  Trash2,
  Clock,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Users,
  Copy,
  Archive,
  Flag,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { TrelloCard, TrelloLabel, ChecklistItem, Priority, LabelColor } from '@/types/trello';

interface TrelloCardModalProps {
  card: TrelloCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (cardId: string, updates: Partial<TrelloCard>) => void;
  onDelete: (cardId: string) => void;
  listTitle?: string;
}

const priorityConfig = {
  urgent: { label: '紧急', color: 'bg-red-500', icon: '🔴' },
  high: { label: '高', color: 'bg-orange-500', icon: '🟠' },
  normal: { label: '中', color: 'bg-blue-500', icon: '🔵' },
  low: { label: '低', color: 'bg-gray-400', icon: '⚪' }
};

const labelColors: { [key in LabelColor]: string } = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  sky: 'bg-sky-500',
  lime: 'bg-lime-500',
  pink: 'bg-pink-500',
  black: 'bg-gray-900'
};

export function TrelloCardModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  listTitle = '未分类'
}: TrelloCardModalProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('normal');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setSelectedPriority(card.priority);
    }
  }, [card]);

  if (!card || !isOpen) return null;

  const handleTitleSave = () => {
    if (title.trim() && title !== card.title) {
      onUpdate(card.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (description !== card.description) {
      onUpdate(card.id, { description });
    }
    setIsEditingDescription(false);
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: `check-${Date.now()}`,
        text: newChecklistItem.trim(),
        completed: false,
        position: card.checklist.length
      };
      onUpdate(card.id, {
        checklist: [...card.checklist, newItem]
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    const updatedChecklist = card.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdate(card.id, { checklist: updatedChecklist });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    const updatedChecklist = card.checklist.filter(item => item.id !== itemId);
    onUpdate(card.id, { checklist: updatedChecklist });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        text: newComment.trim(),
        authorId: 'user-1',
        createdAt: new Date()
      };
      onUpdate(card.id, {
        comments: [...card.comments, comment]
      });
      setNewComment('');
    }
  };

  const handlePriorityChange = (priority: Priority) => {
    onUpdate(card.id, { priority });
    setSelectedPriority(priority);
  };

  const handleAddLabel = (color: LabelColor) => {
    const newLabel: TrelloLabel = {
      id: `label-${Date.now()}`,
      color,
      name: ''
    };
    onUpdate(card.id, {
      labels: [...card.labels, newLabel]
    });
    setShowLabelPicker(false);
  };

  const handleRemoveLabel = (labelId: string) => {
    onUpdate(card.id, {
      labels: card.labels.filter(label => label.id !== labelId)
    });
  };

  const handleDueDateChange = (date: string) => {
    onUpdate(card.id, { dueDate: new Date(date) });
    setShowDatePicker(false);
  };

  const completedChecklistItems = card.checklist.filter(item => item.completed).length;
  const checklistProgress = card.checklist.length > 0
    ? (completedChecklistItems / card.checklist.length) * 100
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[768px] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                        className="flex-1 text-xl font-semibold bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleTitleSave}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-xl font-semibold text-gray-900">{card.title}</h2>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-opacity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">在列表 "{listTitle}" 中</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Labels and Priority */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedPriority}
                      onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Labels */}
                  {card.labels.map(label => (
                    <div
                      key={label.id}
                      className={`${labelColors[label.color]} text-white text-xs px-3 py-1 rounded-full flex items-center gap-1`}
                    >
                      <span>{label.name || label.color}</span>
                      <button
                        onClick={() => handleRemoveLabel(label.id)}
                        className="hover:opacity-75"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Label Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLabelPicker(!showLabelPicker)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      <Plus className="w-3 h-3" />
                      <span>添加标签</span>
                    </button>
                    {showLabelPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
                        {Object.keys(labelColors).map(color => (
                          <button
                            key={color}
                            onClick={() => handleAddLabel(color as LabelColor)}
                            className={`${labelColors[color as LabelColor]} w-8 h-8 rounded hover:scale-110 transition-transform`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  {card.dueDate && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(card.dueDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    描述
                  </h3>
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="添加更详细的描述..."
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleDescriptionSave}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setDescription(card.description || '');
                            setIsEditingDescription(false);
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className="min-h-[60px] p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      {description || <span className="text-gray-400">点击添加描述...</span>}
                    </div>
                  )}
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      检查清单
                    </h3>
                    {card.checklist.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {completedChecklistItems}/{card.checklist.length}
                        </span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${checklistProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-1 mb-3">
                    {card.checklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                        />
                        <span
                          className={`flex-1 ${
                            item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Checklist Item */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                      placeholder="添加检查项..."
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      添加
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    评论 ({card.comments.length})
                  </h3>

                  {/* Comments List */}
                  <div className="space-y-3 mb-3">
                    {card.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                          U
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{comment.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="写评论..."
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-200 rounded">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">成员</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-200 rounded">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm">附件</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-200 rounded">
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">复制</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-200 rounded">
                    <Archive className="w-4 h-4" />
                    <span className="text-sm">归档</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这张卡片吗？')) {
                      onDelete(card.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">删除</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}