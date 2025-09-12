'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '@/hooks/todos/useNotification';

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = icons[notification.type];
        
        return (
          <div
            key={notification.id}
            className={`flex items-start p-4 rounded-lg shadow-lg border ${colors[notification.type]} max-w-sm animate-slide-in-right`}
          >
            <Icon className={`w-5 h-5 mr-3 mt-0.5 ${iconColors[notification.type]}`} />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm mt-1 opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => onClose(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}