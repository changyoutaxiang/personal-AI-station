import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // 自动移除通知
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title: string = '成功') => {
    return addNotification('success', title, message);
  }, [addNotification]);

  const showError = useCallback((message: string, title: string = '错误') => {
    return addNotification('error', title, message, 8000);
  }, [addNotification]);

  const showWarning = useCallback((message: string, title: string = '警告') => {
    return addNotification('warning', title, message, 6000);
  }, [addNotification]);

  const showInfo = useCallback((message: string, title: string = '提示') => {
    return addNotification('info', title, message);
  }, [addNotification]);

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };
}