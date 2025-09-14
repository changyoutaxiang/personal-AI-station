'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Plus,
  MoreHorizontal,
  X,
  Archive,
  Copy,
  ArrowRight,
  Settings,
  Layout
} from 'lucide-react';
import { TrelloList as TrelloListType, TrelloCard } from '@/types/trello';
import { TrelloCard as TrelloCardComponent } from './TrelloCard';

interface TrelloListProps {
  list: TrelloListType;
  onCardUpdate: (cardId: string, updates: Partial<TrelloCard>) => void;
  onCardDelete: (cardId: string) => void;
  onCardClick: (cardId: string) => void;
  onCardCreate: (listId: string, title: string) => void;
  onListUpdate: (listId: string, updates: Partial<TrelloListType>) => void;
  onListDelete: (listId: string) => void;
}

export function TrelloList({
  list,
  onCardUpdate,
  onCardDelete,
  onCardClick,
  onCardCreate,
  onListUpdate,
  onListDelete,
}: TrelloListProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: {
      type: 'List',
      list,
    },
  });

  const cardIds = list.cards.map(card => card.id);

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      onCardCreate(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleTitleSave = () => {
    if (editTitle.trim() !== list.title) {
      onListUpdate(list.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isAddingCard) {
        handleAddCard();
      } else if (isEditingTitle) {
        handleTitleSave();
      }
    } else if (e.key === 'Escape') {
      if (isAddingCard) {
        setIsAddingCard(false);
        setNewCardTitle('');
      } else if (isEditingTitle) {
        setEditTitle(list.title);
        setIsEditingTitle(false);
      }
      setShowMenu(false);
    }
  };

  const isAtWipLimit = list.wipLimit && list.cards.length >= list.wipLimit;

  return (
    <div className="flex flex-col w-80 lg:w-96 xl:w-[420px] 2xl:w-[480px] bg-white rounded-2xl max-h-full shadow-sm hover:shadow-md transition-all duration-300">
      {/* List Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyPress}
              className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-gray-800 p-1 -m-1 rounded focus:bg-white focus:shadow-sm"
              autoFocus
            />
          ) : (
            <h3
              className="flex-1 text-base font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}

          <div className="flex items-center space-x-1">
            {/* WIP Limit indicator */}
            {list.wipLimit && (
              <span className={`text-xs px-2 py-1 rounded ${
                isAtWipLimit ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {list.cards.length}/{list.wipLimit}
              </span>
            )}

            {/* List Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-56"
                  >
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 text-center">列表操作</div>

                      <button
                        onClick={() => {
                          setIsAddingCard(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加卡片</span>
                      </button>

                      <button
                        onClick={() => {
                          // 复制列表功能
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>复制列表</span>
                      </button>

                      <button
                        onClick={() => {
                          // 移动列表功能
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>移动列表</span>
                      </button>

                      <hr className="my-2" />

                      <button
                        onClick={() => {
                          onListDelete(list.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded text-red-600 flex items-center space-x-2"
                      >
                        <Archive className="w-4 h-4" />
                        <span>归档此列表</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 transition-all duration-200 overflow-y-auto ${
          isOver ? 'bg-blue-50/50' : ''
        }`}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[100px]">
            <AnimatePresence>
              {list.cards.map((card) => (
                <TrelloCardComponent
                  key={card.id}
                  card={card}
                  onUpdate={onCardUpdate}
                  onDelete={onCardDelete}
                  onClick={onCardClick}
                />
              ))}
            </AnimatePresence>

            {/* Add Card Form */}
            <AnimatePresence>
              {isAddingCard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="为此卡片输入标题..."
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddCard}
                      disabled={!newCardTitle.trim()}
                      className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      添加卡片
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCard(false);
                        setNewCardTitle('');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        // 从模板创建
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="从模板创建"
                    >
                      <Layout className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add Card Button */}
            {!isAddingCard && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsAddingCard(true)}
                disabled={isAtWipLimit}
                className={`
                  w-full py-3 text-sm text-gray-500 rounded-xl
                  hover:bg-gray-50 hover:text-gray-700 transition-all duration-200
                  flex items-center justify-center space-x-2
                  ${isAtWipLimit ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Plus className="w-5 h-5" />
                <span>{isAtWipLimit ? 'WIP限制已满' : '添加卡片'}</span>
              </motion.button>
            )}

            {/* Empty State */}
            {list.cards.length === 0 && !isAddingCard && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">拖拽卡片到此处</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}