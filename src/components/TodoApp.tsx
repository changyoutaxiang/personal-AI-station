'use client';

import React, { useState } from 'react';
import { TodayView } from './TodayView';
import { WeekView } from './WeekView';
import { Animated } from './animations';

const TodoApp = () => {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="rounded-xl overflow-hidden border" style={{ 
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div className="flex border-b" style={{ borderColor: 'var(--card-border)' }}>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-8 py-5 text-base font-medium transition-all duration-200 ${
                activeTab === 'today'
                  ? ''
                  : ''
              }`}
              style={{
                backgroundColor: activeTab === 'today' ? 'var(--dynamic-primary)/10' : 'transparent',
                color: activeTab === 'today' ? 'var(--dynamic-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'today' ? '3px solid var(--dynamic-primary)' : '3px solid transparent'
              }}
            >
              今日
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-8 py-5 text-base font-medium transition-all duration-200 ${
                activeTab === 'week'
                  ? ''
                  : ''
              }`}
              style={{
                backgroundColor: activeTab === 'week' ? 'var(--dynamic-primary)/10' : 'transparent',
                color: activeTab === 'week' ? 'var(--dynamic-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'week' ? '3px solid var(--dynamic-primary)' : '3px solid transparent'
              }}
            >
              本周
            </button>
          </div>
          <div className="p-8">
            <Animated animation="fadeIn" duration={300}>
              {activeTab === 'today' && <TodayView />}
              {activeTab === 'week' && <WeekView />}
            </Animated>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;