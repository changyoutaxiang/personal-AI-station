'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Home,
  ChevronDown,
  Plus,
  Filter,
  Download,
  Bell,
  Search,
} from 'lucide-react';
import { useTrelloStorage } from '@/hooks/useTrelloStorage';
import { TrelloBoard } from '@/components/trello/TrelloBoard';
import { GanttChart } from '@/components/project-management/GanttChart';
import { ProjectDashboard } from '@/components/project-management/ProjectDashboard';
import { BurndownChart } from '@/components/project-management/BurndownChart';
import { TrelloCard, TrelloDragEvent } from '@/types/trello';
import { addDays } from 'date-fns';

type ViewMode = 'kanban' | 'gantt' | 'dashboard' | 'burndown';

export default function ProjectViewPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState('board-default');

  const {
    boards,
    loading,
    error,
    getBoard,
    updateBoard,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  } = useTrelloStorage();

  // 获取当前看板
  const currentBoard = useMemo(() => {
    return getBoard(selectedProjectId) || boards[0];
  }, [boards, selectedProjectId, getBoard]);

  // 获取所有卡片
  const allCards = useMemo(() => {
    if (!currentBoard) return [];
    return currentBoard.lists.flatMap(list => list.cards);
  }, [currentBoard]);

  // 计算项目日期范围
  const { projectStartDate, projectEndDate } = useMemo(() => {
    if (allCards.length === 0) {
      return {
        projectStartDate: new Date(),
        projectEndDate: addDays(new Date(), 30),
      };
    }

    const dates = allCards.flatMap(card => {
      const dates = [card.createdAt];
      if (card.dueDate) dates.push(card.dueDate);
      if (card.plannedStartDate) dates.push(card.plannedStartDate);
      if (card.plannedEndDate) dates.push(card.plannedEndDate);
      return dates.filter(Boolean).map(d => new Date(d));
    });

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      projectStartDate: addDays(minDate, -7),
      projectEndDate: addDays(maxDate, 7),
    };
  }, [allCards]);

  // 处理看板事件
  const handleBoardUpdate = (boardId: string, updates: any) => {
    updateBoard(boardId, updates);
  };

  const handleListCreate = (boardId: string, title: string) => {
    createList(boardId, title);
  };

  const handleListUpdate = (listId: string, updates: any) => {
    if (!currentBoard) return;
    updateList(currentBoard.id, listId, updates);
  };

  const handleListDelete = (listId: string) => {
    if (!currentBoard) return;
    deleteList(currentBoard.id, listId);
  };

  const handleCardCreate = (listId: string, title: string) => {
    if (!currentBoard) return;
    createCard(currentBoard.id, listId, title);
  };

  const handleCardUpdate = (cardId: string, updates: any) => {
    if (!currentBoard) return;
    updateCard(currentBoard.id, cardId, updates);
  };

  const handleCardDelete = (cardId: string) => {
    if (!currentBoard) return;
    deleteCard(currentBoard.id, cardId);
  };

  const handleCardMove = (event: TrelloDragEvent) => {
    if (!currentBoard) return;
    const { cardId, sourceListId, targetListId, newPosition } = event;
    moveCard(currentBoard.id, cardId, sourceListId, targetListId, newPosition);
  };

  const handleCardClick = (cardId: string) => {
    // 打开卡片详情
    console.log('Card clicked:', cardId);
  };

  // 处理导出
  const handleExport = () => {
    console.log('Exporting data...');
    // 实现导出逻辑
  };

  // 处理视图详情
  const handleViewDetails = (section: string) => {
    console.log('View details:', section);
    // 实现查看详情逻辑
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载项目数据...</p>
        </div>
      </div>
    );
  }

  if (error || !currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">加载失败: {error || '未找到项目'}</p>
          <button
            onClick={() => router.push('/trello')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：项目信息 */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/trello')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
                <span>返回</span>
              </button>

              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-gray-900">{currentBoard.title}</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {allCards.length} 任务
                </span>
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索任务..."
                  className="w-64 px-4 py-2 pl-10 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Filter className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Download className="w-5 h-5" />
              </button>

              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>新建任务</span>
              </button>
            </div>
          </div>

          {/* 视图切换标签 */}
          <div className="flex items-center space-x-1 mt-6">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'kanban'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>看板</span>
            </button>

            <button
              onClick={() => setCurrentView('gantt')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'gantt'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>甘特图</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>仪表板</span>
            </button>

            <button
              onClick={() => setCurrentView('burndown')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'burndown'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>燃尽图</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {currentView === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-200px)]"
            >
              <TrelloBoard
                board={currentBoard}
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
            </motion.div>
          )}

          {currentView === 'gantt' && (
            <motion.div
              key="gantt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GanttChart
                tasks={allCards}
                onTaskClick={(task) => handleCardClick(task.id)}
                onTaskUpdate={(taskId, updates) => handleCardUpdate(taskId, updates)}
                initialShowDependencies={true}
                initialShowCriticalPath={true}
                initialShowResourceNames={true}
                initialShowProgress={true}
                height={600}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectDashboard
                project={currentBoard}
                cards={allCards}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          )}

          {currentView === 'burndown' && (
            <motion.div
              key="burndown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BurndownChart
                tasks={allCards}
                startDate={projectStartDate}
                endDate={projectEndDate}
                showIdealLine={true}
                showActualLine={true}
                showProjection={true}
                showStatistics={true}
                height={500}
                onExport={handleExport}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}