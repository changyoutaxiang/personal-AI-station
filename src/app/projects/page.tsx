'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { Brain, MessageCircle, CheckSquare, Settings, BarChart3, Code, Timer } from 'lucide-react';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { ProjectService } from '@/lib/services/projectService';
import { Project, ProjectWithStats, CreateProjectRequest } from '@/types/project';
import { Theme } from '@/types/todo';

function ProjectsPageContent() {
  const router = useRouter();
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');
  
  // 项目管理状态
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CheckSquare,
      label: '待办',
      href: '/todos',
      color: 'from-orange-500 to-red-600'
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
    },
    {
      icon: Timer,
      label: '番茄钟',
      href: '#',
      color: 'from-red-500 to-orange-600',
      onClick: () => setShowPomodoro(!showPomodoro)
    }
  ];

  // 加载项目列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectService.getProjects({ limit: 100 });
      setProjects(response.projects);
    } catch (error) {
      console.error('加载项目失败:', error);
      toast.error('加载项目失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadProjects();
  }, []);

  // 创建新项目
  const handleProjectCreate = () => {
    setEditingProject(undefined);
    setShowProjectForm(true);
  };

  // 编辑项目
  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  // 删除项目
  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      return;
    }

    try {
      await ProjectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('项目删除成功');
    } catch (error) {
      console.error('删除项目失败:', error);
      toast.error('删除项目失败: ' + (error as Error).message);
    }
  };

  // 更改项目状态
  const handleProjectStatusChange = async (projectId: string, status: Project['status']) => {
    try {
      const updatedProject = await ProjectService.updateProject(projectId, { status });
      setProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, ...updatedProject }
            : p
        )
      );
      toast.success('状态更新成功');
    } catch (error) {
      console.error('状态更新失败:', error);
      toast.error('状态更新失败: ' + (error as Error).message);
    }
  };

  // 查看项目详情
  const handleProjectView = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // 保存项目
  const handleProjectSave = async (projectData: CreateProjectRequest) => {
    try {
      setFormLoading(true);
      
      if (editingProject) {
        // 更新项目
        const updatedProject = await ProjectService.updateProject(editingProject.id, projectData);
        setProjects(prev =>
          prev.map(p =>
            p.id === editingProject.id
              ? { ...p, ...updatedProject }
              : p
          )
        );
        toast.success('项目更新成功');
      } else {
        // 创建项目
        const newProject = await ProjectService.createProject(projectData);
        setProjects(prev => [{
          ...newProject,
          taskCount: 0,
          completedTasks: 0,
          subProjects: []
        }, ...prev]);
        toast.success('项目创建成功');
      }
    } catch (error) {
      console.error('保存项目失败:', error);
      toast.error('保存项目失败: ' + (error as Error).message);
      throw error; // 让表单组件处理错误状态
    } finally {
      setFormLoading(false);
    }
  };

  // 关闭表单
  const handleFormClose = () => {
    setShowProjectForm(false);
    setEditingProject(undefined);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--background)'}}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* 右上角导航 */}
      <nav className="absolute top-6 right-6 z-20">
        <div className="flex gap-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`group relative p-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105`}
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)'
                }}
                title={item.label}
              >
                <IconComponent className="w-5 h-5" />
                
                {/* 悬停提示 */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="px-2 py-1 rounded whitespace-nowrap text-xs" style={{
                    backgroundColor: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--card-border)'
                  }}>
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-6 relative z-10">
        <header className="text-center mb-6 md:mb-8 px-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight" style={{color: 'var(--text-primary)'}}>
            项目管理
          </h1>
          <p className="text-base md:text-lg opacity-80" style={{color: 'var(--text-secondary)'}}>
            管理您的项目和任务，跟踪进度和成果
          </p>
        </header>

        {/* 项目列表 */}
        <ProjectList
          projects={projects}
          loading={loading}
          onProjectEdit={handleProjectEdit}
          onProjectDelete={handleProjectDelete}
          onProjectStatusChange={handleProjectStatusChange}
          onProjectView={handleProjectView}
          onProjectCreate={handleProjectCreate}
        />
      </div>

      {/* 项目表单弹窗 */}
      <ProjectForm
        project={editingProject}
        isOpen={showProjectForm}
        onClose={handleFormClose}
        onSave={handleProjectSave}
        parentProjects={projects}
        loading={formLoading}
      />

      {/* 番茄钟组件 */}
      <div className="absolute top-20 right-6 z-30">
        <ThemeProvider theme={theme} setTheme={setTheme}>
          <PomodoroTimer isVisible={showPomodoro} onToggle={() => setShowPomodoro(!showPomodoro)} />
        </ThemeProvider>
      </div>

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
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}