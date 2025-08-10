'use client';

import { Toaster } from 'react-hot-toast';
import { ChatLayout } from '@/components/agent';
import { ChatProvider } from '@/contexts/ChatContext';

export default function AgentPage() {
  return (
    <ChatProvider>
      <ChatLayout />

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card-glass)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--card-border)',
          },
        }}
      />
    </ChatProvider>
  );
}
