'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrelloBoard, TrelloList, TrelloCard } from '@/types/trello';

const STORAGE_KEY = 'trello_boards';

// 创建默认看板
const createDefaultBoard = (): TrelloBoard => {
  const boardId = 'board-default';
  const now = new Date();

  const lists: TrelloList[] = [
    {
      id: 'list-inbox',
      title: '📥 收件箱',
      boardId,
      position: 0,
      cards: [],
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: 'list-today',
      title: '🎯 今天',
      boardId,
      position: 1,
      cards: [],
      createdAt: now,
      updatedAt: now,
      archived: false,
      wipLimit: 5,
    },
    {
      id: 'list-week',
      title: '📅 本周',
      boardId,
      position: 2,
      cards: [],
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: 'list-done',
      title: '✅ 已完成',
      boardId,
      position: 3,
      cards: [],
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
  ];

  return {
    id: boardId,
    title: '我的任务看板',
    description: '个人任务和项目管理',
    lists,
    createdAt: now,
    updatedAt: now,
    starred: true,
    visibility: 'private',
    settings: {
      allowComments: true,
      allowInvitations: false,
      allowVoting: false,
      cardCover: true,
      selfJoin: false,
    },
    members: [],
    admins: [],
  };
};

export function useTrelloStorage() {
  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从本地存储加载数据
  const loadBoards = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedBoards = JSON.parse(stored);
        // 转换日期字符串为 Date 对象
        const boards = parsedBoards.map((board: any) => ({
          ...board,
          createdAt: new Date(board.createdAt),
          updatedAt: new Date(board.updatedAt),
          lists: board.lists.map((list: any) => ({
            ...list,
            createdAt: new Date(list.createdAt),
            updatedAt: new Date(list.updatedAt),
            cards: list.cards.map((card: any) => ({
              ...card,
              createdAt: new Date(card.createdAt),
              updatedAt: new Date(card.updatedAt),
              dueDate: card.dueDate ? new Date(card.dueDate) : undefined,
              comments: (card.comments || []).map((comment: any) => ({
                ...comment,
                createdAt: new Date(comment.createdAt),
                updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
              })),
              attachments: (card.attachments || []).map((attachment: any) => ({
                ...attachment,
                uploadedAt: new Date(attachment.uploadedAt),
              })),
              checklist: (card.checklist || []).map((item: any) => ({
                ...item,
                dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
              })),
            })),
          })),
        }));
        setBoards(boards);
      } else {
        // 如果没有存储的数据，创建默认看板
        const defaultBoard = createDefaultBoard();
        setBoards([defaultBoard]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultBoard]));
      }
    } catch (err) {
      console.error('Failed to load boards:', err);
      setError('加载看板数据失败');
      // 出错时创建默认看板
      const defaultBoard = createDefaultBoard();
      setBoards([defaultBoard]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存数据到本地存储
  const saveBoards = useCallback((boards: TrelloBoard[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
      setBoards(boards);
      setError(null);
    } catch (err) {
      console.error('Failed to save boards:', err);
      setError('保存看板数据失败');
    }
  }, []);

  // 获取单个看板
  const getBoard = useCallback((boardId: string) => {
    return boards.find(board => board.id === boardId);
  }, [boards]);

  // 更新看板
  const updateBoard = useCallback((boardId: string, updates: Partial<TrelloBoard>) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId
        ? { ...board, ...updates, updatedAt: new Date() }
        : board
    );
    saveBoards(updatedBoards);
  }, [boards, saveBoards]);

  // 创建新看板
  const createBoard = useCallback((title: string, description?: string) => {
    const newBoard: TrelloBoard = {
      id: `board-${Date.now()}`,
      title,
      description,
      lists: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      starred: false,
      visibility: 'private',
      settings: {
        allowComments: true,
        allowInvitations: false,
        allowVoting: false,
        cardCover: true,
        selfJoin: false,
      },
      members: [],
      admins: [],
    };
    saveBoards([...boards, newBoard]);
    return newBoard;
  }, [boards, saveBoards]);

  // 删除看板
  const deleteBoard = useCallback((boardId: string) => {
    const updatedBoards = boards.filter(board => board.id !== boardId);
    saveBoards(updatedBoards);
  }, [boards, saveBoards]);

  // 创建列表
  const createList = useCallback((boardId: string, title: string) => {
    const board = getBoard(boardId);
    if (!board) return null;

    const newList: TrelloList = {
      id: `list-${Date.now()}`,
      title,
      boardId,
      position: board.lists.length,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    };

    updateBoard(boardId, {
      lists: [...board.lists, newList],
    });

    return newList;
  }, [getBoard, updateBoard]);

  // 更新列表
  const updateList = useCallback((boardId: string, listId: string, updates: Partial<TrelloList>) => {
    const board = getBoard(boardId);
    if (!board) return;

    const updatedLists = board.lists.map(list =>
      list.id === listId
        ? { ...list, ...updates, updatedAt: new Date() }
        : list
    );

    updateBoard(boardId, { lists: updatedLists });
  }, [getBoard, updateBoard]);

  // 删除列表
  const deleteList = useCallback((boardId: string, listId: string) => {
    const board = getBoard(boardId);
    if (!board) return;

    const updatedLists = board.lists.filter(list => list.id !== listId);
    updateBoard(boardId, { lists: updatedLists });
  }, [getBoard, updateBoard]);

  // 创建卡片
  const createCard = useCallback((boardId: string, listId: string, title: string, description?: string) => {
    const board = getBoard(boardId);
    if (!board) return null;

    const targetList = board.lists.find(list => list.id === listId);
    if (!targetList) return null;

    const newCard: TrelloCard = {
      id: `card-${Date.now()}`,
      title,
      description,
      listId,
      boardId,
      position: targetList.cards.length,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      labels: [],
      checklist: [],
      attachments: [],
      comments: [],
      members: [],
      priority: 'normal',
      tags: [],
    };

    const updatedLists = board.lists.map(list =>
      list.id === listId
        ? { ...list, cards: [...list.cards, newCard], updatedAt: new Date() }
        : list
    );

    updateBoard(boardId, { lists: updatedLists });
    return newCard;
  }, [getBoard, updateBoard]);

  // 更新卡片
  const updateCard = useCallback((boardId: string, cardId: string, updates: Partial<TrelloCard>) => {
    const board = getBoard(boardId);
    if (!board) return;

    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.map(card =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date() }
          : card
      ),
    }));

    updateBoard(boardId, { lists: updatedLists });
  }, [getBoard, updateBoard]);

  // 删除卡片
  const deleteCard = useCallback((boardId: string, cardId: string) => {
    const board = getBoard(boardId);
    if (!board) return;

    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== cardId),
    }));

    updateBoard(boardId, { lists: updatedLists });
  }, [getBoard, updateBoard]);

  // 移动卡片
  const moveCard = useCallback((
    boardId: string,
    cardId: string,
    sourceListId: string,
    targetListId: string,
    newPosition: number
  ) => {
    const board = getBoard(boardId);
    if (!board) return;

    const newLists = [...board.lists];
    const sourceListIndex = newLists.findIndex(list => list.id === sourceListId);
    const targetListIndex = newLists.findIndex(list => list.id === targetListId);

    if (sourceListIndex === -1 || targetListIndex === -1) return;

    // 找到要移动的卡片
    const sourceCards = [...newLists[sourceListIndex].cards];
    const cardIndex = sourceCards.findIndex(card => card.id === cardId);

    if (cardIndex === -1) return;

    const [movedCard] = sourceCards.splice(cardIndex, 1);

    // 更新卡片的 listId 和 position
    movedCard.listId = targetListId;
    movedCard.position = newPosition;

    // 更新源列表
    newLists[sourceListIndex] = {
      ...newLists[sourceListIndex],
      cards: sourceCards.map((card, index) => ({ ...card, position: index })),
      updatedAt: new Date(),
    };

    // 更新目标列表
    if (sourceListId === targetListId) {
      // 同一列表内移动
      sourceCards.splice(newPosition, 0, movedCard);
      newLists[sourceListIndex] = {
        ...newLists[sourceListIndex],
        cards: sourceCards.map((card, index) => ({ ...card, position: index })),
        updatedAt: new Date(),
      };
    } else {
      // 跨列表移动
      const targetCards = [...newLists[targetListIndex].cards];
      targetCards.splice(newPosition, 0, movedCard);

      newLists[targetListIndex] = {
        ...newLists[targetListIndex],
        cards: targetCards.map((card, index) => ({ ...card, position: index })),
        updatedAt: new Date(),
      };
    }

    updateBoard(boardId, { lists: newLists });
  }, [getBoard, updateBoard]);

  // 初始化加载
  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  return {
    boards,
    loading,
    error,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    reload: loadBoards,
  };
}