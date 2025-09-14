'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Plus,
  Star,
  Users,
  Settings,
  Share2,
  Menu,
  Filter,
  Zap,
  Grid3X3,
  Search,
  MoreHorizontal,
  X
} from 'lucide-react';
import {
  TrelloBoard as TrelloBoardType,
  TrelloList as TrelloListType,
  TrelloCard,
  TrelloDragEvent
} from '@/types/trello';
import { TrelloList } from './TrelloList';
import { TrelloCard as TrelloCardComponent } from './TrelloCard';

interface TrelloBoardProps {
  board: TrelloBoardType;
  onBoardUpdate: (boardId: string, updates: Partial<TrelloBoardType>) => void;
  onListCreate: (boardId: string, title: string) => void;
  onListUpdate: (listId: string, updates: Partial<TrelloListType>) => void;
  onListDelete: (listId: string) => void;
  onCardCreate: (listId: string, title: string) => void;
  onCardUpdate: (cardId: string, updates: Partial<TrelloCard>) => void;
  onCardDelete: (cardId: string) => void;
  onCardMove: (event: TrelloDragEvent) => void;
  onCardClick?: (cardId: string) => void;
}

export function TrelloBoard({
  board,
  onBoardUpdate,
  onListCreate,
  onListUpdate,
  onListDelete,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onCardMove,
  onCardClick,
}: TrelloBoardProps) {
  const [activeCard, setActiveCard] = useState<TrelloCard | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState(board.title);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 自定义碰撞检测：优先检测列表
  const customCollisionDetection = (args: any) => {
    // 首先尝试找到列表
    const listCollisions = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container: any) => container.data.current?.type === 'List'
      ),
    });

    // 如果找到列表，返回它
    if (listCollisions.length > 0) {
      return listCollisions;
    }

    // 否则使用默认的碰撞检测
    return closestCenter(args);
  };

  // 排序列表
  const sortedLists = useMemo(() => {
    return [...board.lists].sort((a, b) => a.position - b.position);
  }, [board.lists]);

  // 统计数据
  const stats = useMemo(() => {
    const totalCards = board.lists.reduce((sum, list) => sum + list.cards.length, 0);
    const completedCards = board.lists.reduce(
      (sum, list) => sum + list.cards.filter(card => card.completed).length,
      0
    );
    return {
      totalCards,
      completedCards,
      totalLists: board.lists.length,
      completionRate: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
    };
  }, [board.lists]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // 查找被拖拽的卡片
    for (const list of board.lists) {
      const card = list.cards.find(c => c.id === active.id);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    // 查找源卡片
    let sourceCard: TrelloCard | null = null;
    let sourceListId = '';

    for (const list of board.lists) {
      const card = list.cards.find(c => c.id === active.id);
      if (card) {
        sourceCard = card;
        sourceListId = list.id;
        break;
      }
    }

    if (!sourceCard) return;

    // 确定目标位置
    let targetListId = '';
    let newPosition = 0;

    // 调试日志
    console.log('Drag end:', {
      activeId: active.id,
      overId: over.id,
      overType: over.data.current?.type,
      sourceListId,
    });

    if (over.data.current?.type === 'List') {
      // 拖拽到列表
      targetListId = over.id as string;
      const targetList = board.lists.find(l => l.id === targetListId);
      newPosition = targetList ? targetList.cards.length : 0;
    } else if (over.data.current?.type === 'Card') {
      // 拖拽到其他卡片
      const targetCard = over.data.current.card as TrelloCard;
      targetListId = targetCard.listId;
      newPosition = targetCard.position;
    } else {
      // 如果没有明确的类型，尝试将 over.id 作为列表 ID
      const possibleList = board.lists.find(l => l.id === over.id);
      if (possibleList) {
        targetListId = over.id as string;
        newPosition = possibleList.cards.length;
      }
    }

    console.log('Move params:', {
      cardId: sourceCard.id,
      sourceListId,
      targetListId,
      newPosition,
    });

    // 触发移动事件
    if (targetListId && (sourceListId !== targetListId || sourceCard.position !== newPosition)) {
      onCardMove({
        cardId: sourceCard.id,
        sourceListId,
        targetListId,
        newPosition,
      });
    }
  };

  const handleAddList = () => {
    if (newListTitle.trim()) {
      onListCreate(board.id, newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const handleBoardTitleSave = () => {
    if (editBoardTitle.trim() !== board.title) {
      onBoardUpdate(board.id, { title: editBoardTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const toggleStar = () => {
    onBoardUpdate(board.id, { starred: !board.starred });
  };

  const filteredLists = useMemo(() => {
    if (!searchQuery) return sortedLists;

    return sortedLists.map(list => ({
      ...list,
      cards: list.cards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }));
  }, [sortedLists, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Board Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {isEditingTitle ? (
              <input
                value={editBoardTitle}
                onChange={(e) => setEditBoardTitle(e.target.value)}
                onBlur={handleBoardTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBoardTitleSave();
                  if (e.key === 'Escape') {
                    setEditBoardTitle(board.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-semibold bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 outline-none px-3 py-1.5 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {board.title}
              </h1>
            )}

            <button
              onClick={toggleStar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Star className={`w-5 h-5 ${board.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            </button>

            <div className="text-sm text-gray-500">
              {stats.totalLists} 个列表，共 {stats.totalCards} 张卡片
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索卡片..."
                className="w-48 px-3 py-2 text-sm bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-white/10 rounded transition-colors text-white"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Board Members */}
            <div className="flex items-center space-x-1">
              {board.members.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white border-2 border-white/30"
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
              <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border-2 border-white/30 transition-colors">
                <Users className="w-4 h-4" />
              </button>
            </div>

            {/* Power-Ups */}
            <button className="p-2 hover:bg-white/10 rounded transition-colors text-white">
              <Zap className="w-5 h-5" />
            </button>

            {/* Automation */}
            <button className="p-2 hover:bg-white/10 rounded transition-colors text-white">
              <Grid3X3 className="w-5 h-5" />
            </button>

            {/* Share */}
            <button className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded text-white text-sm font-medium transition-colors flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>

            {/* Board Menu */}
            <button
              onClick={() => setShowBoardMenu(!showBoardMenu)}
              className="p-2 hover:bg-white/10 rounded transition-colors text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full p-6 max-w-[1920px] mx-auto">
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
              {filteredLists.map((list) => (
                <TrelloList
                  key={list.id}
                  list={list}
                  onCardUpdate={onCardUpdate}
                  onCardDelete={onCardDelete}
                  onCardClick={onCardClick}
                  onCardCreate={onCardCreate}
                  onListUpdate={onListUpdate}
                  onListDelete={onListDelete}
                />
              ))}

              {/* Add List Section */}
              <div className="flex-shrink-0 w-80 lg:w-96 xl:w-[420px] 2xl:w-[480px]">
                {isAddingList ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-100 rounded-lg p-3"
                  >
                    <input
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddList();
                        if (e.key === 'Escape') {
                          setIsAddingList(false);
                          setNewListTitle('');
                        }
                      }}
                      placeholder="输入列表标题..."
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={handleAddList}
                        disabled={!newListTitle.trim()}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        添加列表
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListTitle('');
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddingList(true)}
                    className="w-full p-4 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 backdrop-blur-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加另一个列表</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="transform rotate-2">
                <TrelloCardComponent
                  card={activeCard}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onClick={() => {}}
                  isOverlay={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Board Menu Sidebar */}
      <AnimatePresence>
        {showBoardMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowBoardMenu(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">面板设置</h3>
                  <button
                    onClick={() => setShowBoardMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Board Stats */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">面板统计</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-800">{stats.totalLists}</div>
                        <div className="text-gray-600">列表</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-800">{stats.totalCards}</div>
                        <div className="text-gray-600">卡片</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-800">{stats.completedCards}</div>
                        <div className="text-gray-600">已完成</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-semibold text-gray-800">{stats.completionRate}%</div>
                        <div className="text-gray-600">完成率</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">快速操作</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsAddingList(true)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加列表</span>
                      </button>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <Filter className="w-4 h-4" />
                        <span>筛选卡片</span>
                      </button>
                    </div>
                  </div>

                  {/* Board Settings */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">面板设置</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={board.settings.cardCover}
                          onChange={(e) => onBoardUpdate(board.id, {
                            settings: { ...board.settings, cardCover: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span>显示卡片封面</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={board.settings.allowComments}
                          onChange={(e) => onBoardUpdate(board.id, {
                            settings: { ...board.settings, allowComments: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span>允许评论</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Card Detail Modal will be handled by parent component */}
    </div>
  );
}