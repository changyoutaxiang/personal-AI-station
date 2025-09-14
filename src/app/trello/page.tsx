'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Brain,
  MessageCircle,
  Code,
  BarChart3,
  Settings,
  FolderKanban,
  Home,
  Search,
  Bell,
  User,
  Loader2,
  LayoutGrid,
  Calendar,
  Grid3x3,
  ChevronDown,
  LogOut
} from 'lucide-react';
import {
  TrelloBoard as TrelloBoardType,
  TrelloList,
  TrelloCard,
  TrelloDragEvent,
  LabelColor
} from '@/types/trello';
import { TrelloBoard } from '@/components/trello/TrelloBoard';

import { TrelloCardModal } from '@/components/trello/TrelloCardModal';
import { useTrelloStorage } from '@/hooks/useTrelloStorage';

// Mock data for development (保留作为备用)
const createMockBoard = (): TrelloBoardType => {
  const boardId = 'board-1';

  const lists: TrelloList[] = [
    {
      id: 'list-inbox',
      title: '收件箱',
      boardId,
      position: 0,
      cards: [
        {
          id: 'card-1',
          title: '整理桌面文件',
          description: '清理桌面上杂乱的文件，分类整理到对应文件夹',
          listId: 'list-inbox',
          boardId,
          position: 0,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          labels: [
            { id: 'label-1', name: '生活', color: 'green' as LabelColor }
          ],
          checklist: [
            { id: 'check-1', text: '备份重要文件', completed: true, position: 0 },
            { id: 'check-2', text: '删除重复文件', completed: false, position: 1 },
            { id: 'check-3', text: '创建分类文件夹', completed: false, position: 2 }
          ],
          attachments: [],
          comments: [],
          members: [],
          priority: 'normal',
          tags: ['life', 'organization']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false
    },
    {
      id: 'list-today',
      title: '今天',
      boardId,
      position: 1,
      cards: [
        {
          id: 'card-2',
          title: '完成Trello重构',
          description: '实现完整的Trello风格Todo系统',
          listId: 'list-today',
          boardId,
          position: 0,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(),
          labels: [
            { id: 'label-2', name: '工作', color: 'blue' as LabelColor },
            { id: 'label-3', name: '优先', color: 'red' as LabelColor }
          ],
          checklist: [
            { id: 'check-4', text: '设计架构', completed: true, position: 0 },
            { id: 'check-5', text: '实现组件', completed: true, position: 1 },
            { id: 'check-6', text: '测试功能', completed: false, position: 2 },
            { id: 'check-7', text: '优化体验', completed: false, position: 3 }
          ],
          attachments: [],
          comments: [
            {
              id: 'comment-1',
              text: '已经完成了基础架构设计',
              authorId: 'user-1',
              createdAt: new Date()
            }
          ],
          members: [],
          priority: 'high',
          tags: ['development', 'ui']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
      wipLimit: 3
    },
    {
      id: 'list-week',
      title: '本周',
      boardId,
      position: 2,
      cards: [
        {
          id: 'card-3',
          title: '学习新技术栈',
          listId: 'list-week',
          boardId,
          position: 0,
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          labels: [
            { id: 'label-4', name: '学习', color: 'purple' as LabelColor }
          ],
          checklist: [],
          attachments: [],
          comments: [],
          members: [],
          priority: 'normal',
          tags: ['learning']
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false
    },
    {
      id: 'list-later',
      title: '稍后',
      boardId,
      position: 3,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false
    }
  ];

  return {
    id: boardId,
    title: '我的个人工作面板',
    description: '个人任务和项目管理',
    lists,
    createdAt: new Date(),
    updatedAt: new Date(),
    starred: true,
    visibility: 'private',
    settings: {
      allowComments: true,
      allowInvitations: true,
      allowVoting: false,
      cardCover: true,
      selfJoin: false,
    },
    members: [
      {
        id: 'user-1',
        name: 'Woon Leon',
        email: 'woon@example.com',
        initials: 'WL',
        avatar: undefined
      }
    ],
    admins: [
      {
        id: 'user-1',
        name: 'Woon Leon',
        email: 'woon@example.com',
        initials: 'WL',
        avatar: undefined
      }
    ]
  };
};

export default function TrelloPage() {
  const router = useRouter();
  const {
    boards,
    loading: storageLoading,
    error,
    getBoard,
    updateBoard,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard
  } = useTrelloStorage();

  // 使用第一个看板，如果没有则创建默认看板
  const [currentBoardId] = useState('board-default');
  const board = useMemo(() => {
    return getBoard(currentBoardId) || boards[0];
  }, [boards, currentBoardId, getBoard]);


  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TrelloCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      icon: Home,
      label: '首页',
      href: '/',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: FolderKanban,
      label: '项目',
      href: '/projects',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Code,
      label: 'HTML渲染',
      href: '/html-renderer',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  // Handler functions - 使用持久化存储
  const handleBoardUpdate = (boardId: string, updates: Partial<TrelloBoardType>) => {
    updateBoard(boardId, updates);
  };

  const handleListCreate = (boardId: string, title: string) => {
    createList(boardId, title);
  };

  const handleListUpdate = (listId: string, updates: Partial<TrelloList>) => {
    if (!board) return;
    updateList(board.id, listId, updates);
  };

  const handleListDelete = (listId: string) => {
    if (!board) return;
    deleteList(board.id, listId);
  };

  const handleCardCreate = (listId: string, title: string) => {
    if (!board) return;
    createCard(board.id, listId, title);
  };

  const handleCardUpdate = (cardId: string, updates: Partial<TrelloCard>) => {
    if (!board) return;
    updateCard(board.id, cardId, updates);
  };

  const handleCardDelete = (cardId: string) => {
    if (!board) return;
    deleteCard(board.id, cardId);
  };

  const handleCardMove = (event: TrelloDragEvent) => {
    if (!board) return;
    const { cardId, sourceListId, targetListId, newPosition } = event;
    moveCard(board.id, cardId, sourceListId, targetListId, newPosition);
  };

  const handleCardClick = (cardId: string) => {
    // 查找被点击的卡片
    if (!board) return;

    for (const list of board.lists) {
      const card = list.cards.find(c => c.id === cardId);
      if (card) {
        setSelectedCard(card);
        setIsCardModalOpen(true);
        break;
      }
    }
  };

  const getListTitle = (listId: string) => {
    if (!board) return '未分类';
    const list = board.lists.find(l => l.id === listId);
    return list ? list.title : '未分类';
  };

  // 处理加载状态
  if (storageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">加载看板数据中...</p>
        </div>
      </div>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-8">
          <p className="text-white text-lg mb-4">加载失败: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/30 hover:bg-white/40 text-white rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 确保有看板数据
  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">没有找到看板数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* 统一的顶部导航栏 */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-3">
          {/* 左侧：品牌和面板信息 */}
          <div className="flex items-center space-x-8">
            {/* Logo 和标题 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center shadow-lg">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">超级助理</h1>
              </button>
            </div>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-white/20"></div>

            {/* 面板标题和星标 */}
            <div className="flex items-center space-x-2">
              <span className="text-white/80 text-sm">我的任务看板</span>
              <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              </button>
              <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">私有</span>
            </div>

            {/* 项目管理视图按钮 */}
            <button
              onClick={() => router.push('/trello/project-view')}
              className="ml-4 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center space-x-2 shadow-lg"
            >
              <BarChart3 className="w-4 h-4" />
              <span>项目管理视图</span>
            </button>


          </div>

          {/* 右侧：功能区 */}
          <div className="flex items-center space-x-3">
            {/* 搜索框 - 更紧凑 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="w-48 px-3 py-1.5 pl-9 text-sm bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>

            {/* 分隔线 */}
            <div className="w-px h-6 bg-white/20"></div>

            {/* 快速导航 - 使用下拉菜单整合 */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                <Grid3x3 className="w-5 h-5" />
                <span className="text-sm">应用</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* 下拉菜单 */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <IconComponent className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 通知 */}
            <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              {/* 通知红点 */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 用户菜单 */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-all">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  WL
                </div>
                <ChevronDown className="w-3 h-3 text-white/60" />
              </button>

              {/* 用户下拉菜单 */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Woon Leon</p>
                    <p className="text-xs text-gray-500">woon@example.com</p>
                  </div>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">个人资料</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">设置</span>
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">退出登录</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 h-[calc(100vh-60px)]">
        <TrelloBoard
          board={board}
          onBoardUpdate={handleBoardUpdate}
          onListCreate={handleListCreate}
          onListUpdate={handleListUpdate}
          onListDelete={handleListDelete}
          onCardCreate={handleCardCreate}
          onCardUpdate={handleCardUpdate}
          onCardDelete={handleCardDelete}
          onCardMove={handleCardMove}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Card Detail Modal */}
      <TrelloCardModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onUpdate={handleCardUpdate}
        onDelete={(cardId) => {
          handleCardDelete(cardId);
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        listTitle={selectedCard ? getListTitle(selectedCard.listId) : ''}
      />
    </div>
  );
}