import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { Sidebar } from './components/layout/Sidebar';

interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  time?: string;
  subProject?: string;
  projectName?: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'FSD产品规划会议',
      description: '讨论下一季度产品路线图',
      status: 'todo',
      priority: 'high',
      time: '09:00 - 10:00',
      subProject: '会议',
      projectName: 'FSD'
    },
    {
      id: 2,
      title: '与设计团队沟通界面修改',
      description: '确认新设计稿的实现细节',
      status: 'in-progress',
      priority: 'medium',
      time: '10:30 - 11:30',
      subProject: '沟通',
      projectName: 'FSD'
    }
  ]);
  
  const handleUpdateTask = (taskId: string | number, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSidebarOpen(true);
  };

  // 键盘快捷键
  useHotkeys('cmd+n', () => {
    console.log('新建任务快捷键触发');
  });
  
  useHotkeys('cmd+f', () => {
    console.log('搜索焦点快捷键触发');
  });
  
  useHotkeys('cmd+1', () => setActiveTab('today'));
  useHotkeys('cmd+2', () => setActiveTab('week'));
  useHotkeys('escape', () => setIsSidebarOpen(false));

  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-gray-50">
        <header className="w-full bg-gradient-to-r from-gray-100 to-blue-50 px-6 py-4 shadow-sm border-b border-gray-200">
          <h1 className="text-2xl font-medium text-gray-800">待办事项</h1>
        </header>
        <div className="w-full max-w-7xl mx-auto px-2 py-6 flex-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="flex border-b border-gray-200">
              <button onClick={() => setActiveTab('today')} className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'today' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                今日
              </button>
              <button onClick={() => setActiveTab('week')} className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'week' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                本周
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'today' && <TodayView tasks={tasks} onTaskClick={handleTaskClick} />}
              {activeTab === 'week' && <WeekView tasks={tasks} onTaskClick={handleTaskClick} />}
            </div>
          </div>
        </div>
      </div>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
      />
    </>
  );
}