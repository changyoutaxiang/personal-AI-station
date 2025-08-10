import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, TrophyIcon, SparklesIcon, ChevronDownIcon, ChevronRightIcon, LayoutGridIcon, ListIcon } from 'lucide-react';

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

interface WeekViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const projectColors: Record<string, string> = {
  FSD: 'indigo',
  AIEC: 'blue',
  训战营: 'emerald',
  管理会议: 'amber',
  组织赋能: 'purple',
  其他: 'gray'
};

const subProjectColors: Record<string, string> = {
  会议: 'bg-red-100 text-red-800',
  沟通: 'bg-blue-100 text-blue-800',
  思考: 'bg-purple-100 text-purple-800',
  周会: 'bg-orange-100 text-orange-800',
  直播: 'bg-emerald-100 text-emerald-800',
  备课: 'bg-teal-100 text-teal-800'
};

const dayColors: Record<string, string> = {
  周一: 'text-blue-600',
  周二: 'text-purple-600',
  周三: 'text-green-600',
  周四: 'text-orange-600',
  周五: 'text-red-600'
};

export const WeekView: React.FC<WeekViewProps> = ({ tasks, onTaskClick }) => {
  const [viewMode, setViewMode] = useState<'project' | 'calendar'>('project');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    FSD: true,
    AIEC: false,
    训战营: false,
    管理会议: false,
    组织赋能: false,
    其他: false
  });

  const toggleProject = (project: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };

  const isCompleted = (status: string) => status === 'completed';

  // 按项目分组任务
  const projectsData = [
    { name: 'FSD', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === 'FSD') },
    { name: 'AIEC', subProjects: ['周会', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === 'AIEC') },
    { name: '训战营', subProjects: ['直播', '备课', '思考'], tasks: tasks.filter(t => t.projectName === '训战营') },
    { name: '管理会议', subProjects: ['会议', '思考'], tasks: tasks.filter(t => t.projectName === '管理会议') },
    { name: '组织赋能', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === '组织赋能') },
    { name: '其他', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === '其他') }
  ].filter(project => project.tasks.length > 0);

  // 按日期分组任务
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const dayTasks: Record<string, Task[]> = {};
  
  days.forEach(day => {
    dayTasks[day] = tasks.map(task => ({
      ...task,
      // 为演示目的，随机分配到工作日
      day: ['周一', '周二', '周三', '周四', '周五'][Math.floor(Math.random() * 5)]
    })).filter(task => task.day === day);
  });

  const getProjectColorClasses = (projectName: string, isExpanded: boolean) => {
    const color = projectColors[projectName] || 'gray';
    return {
      header: isExpanded ? `bg-${color}-50 border-l-4 border-${color}-500` : `bg-gray-50 border-l-4 border-${color}-300`,
      title: isExpanded ? `text-${color}-700` : 'text-gray-900'
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">本周任务</h2>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-md">
          <button 
            onClick={() => setViewMode('project')} 
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'project' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ListIcon className="w-4 h-4 mr-1.5" />
            项目视图
          </button>
          <button 
            onClick={() => setViewMode('calendar')} 
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutGridIcon className="w-4 h-4 mr-1.5" />
            日历视图
          </button>
        </div>
      </div>

      {viewMode === 'project' ? (
        <div className="space-y-4">
          {projectsData.map(project => {
            const colorClasses = getProjectColorClasses(project.name, expandedProjects[project.name]);
            return (
              <div key={project.name} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div 
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${colorClasses.header}`}
                  onClick={() => toggleProject(project.name)}
                >
                  <h3 className={`text-base font-medium ${colorClasses.title}`}>{project.name}</h3>
                  <div>
                    {expandedProjects[project.name] ? <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : <ChevronRightIcon className="w-5 h-5 text-gray-500" />}
                  </div>
                </div>
                
                {expandedProjects[project.name] && (
                  <div className="p-4 bg-white">
                    {project.tasks.length > 0 ? (
                      <div className="space-y-6">
                        {project.subProjects.map(subProject => {
                          const subProjectTasks = project.tasks.filter(task => task.subProject === subProject);
                          if (subProjectTasks.length === 0) return null;
                          
                          return (
                            <div key={subProject} className="ml-2">
                              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${subProjectColors[subProject]} mr-2`}>
                                  {subProject}
                                </span>
                              </h4>
                              <div className="space-y-2">
                                {subProjectTasks.map(task => {
                                  const color = projectColors[project.name] || 'gray';
                                  const completed = isCompleted(task.status);
                                  return (
                                    <div 
                                      key={task.id} 
                                      className={`p-3 rounded-lg border cursor-pointer ${
                                        completed 
                                          ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-inner' 
                                          : `bg-white border-${color}-200 hover:border-${color}-300`
                                      } transition-all hover:shadow-md`}
                                      onClick={() => onTaskClick(task)}
                                    >
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                          {completed ? (
                                            <div className="relative">
                                              <CheckCircleIcon className="w-5 h-5 text-green-500 animate-pulse" />
                                              <div className="absolute -top-1 -right-1">
                                                <SparklesIcon className="w-3 h-3 text-yellow-500" />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className={`w-5 h-5 rounded-full border-2 border-${color}-300 hover:border-${color}-500 transition-colors`} />
                                          )}
                                        </div>
                                        <div className="ml-3 flex-1">
                                          <div className="flex items-center">
                                            <h3 className={`text-base font-medium ${completed ? 'text-green-700' : 'text-gray-900'}`}>
                                              {task.title}
                                            </h3>
                                            {completed && (
                                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <TrophyIcon className="w-3 h-3 mr-1" />
                                                已完成
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center mt-2 text-sm text-gray-500">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            <span>{task.time}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-200 rounded-lg">
                        本周无任务
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => (
            <div key={day} className="flex flex-col">
              <div className={`text-center py-2 rounded-t-lg font-medium bg-gray-100`}>
                <span className={dayColors[day] || 'text-gray-700'}>{day}</span>
              </div>
              <div className="border border-gray-200 rounded-b-lg bg-white p-2 flex-1 min-h-[500px]">
                {dayTasks[day] && dayTasks[day].length > 0 ? (
                  <div className="space-y-3">
                    {dayTasks[day].map(task => {
                      const color = projectColors[task.projectName || ''] || 'gray';
                      const completed = isCompleted(task.status);
                      return (
                        <div 
                          key={task.id} 
                          className={`p-3 rounded-lg border cursor-pointer ${
                            completed 
                              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 shadow-inner' 
                              : `bg-white border-${color}-200 hover:border-${color}-300`
                          } transition-all hover:shadow-md`}
                          onClick={() => onTaskClick(task)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {completed ? (
                                <div className="relative">
                                  <CheckCircleIcon className="w-5 h-5 text-green-500 animate-pulse" />
                                  <div className="absolute -top-1 -right-1">
                                    <SparklesIcon className="w-3 h-3 text-yellow-500" />
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-5 h-5 rounded-full border-2 border-${color}-300 hover:border-${color}-500 transition-colors`} />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <h3 className={`text-sm font-medium ${completed ? 'text-green-700' : 'text-gray-900'}`}>
                                  {task.title}
                                </h3>
                                {completed && (
                                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <TrophyIcon className="w-3 h-3 mr-0.5" />
                                    已完成
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-1 mt-2">
                                <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs bg-${color}-100 text-${color}-800`}>
                                  {task.projectName}
                                </span>
                                <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs ${subProjectColors[task.subProject || ''] || 'bg-gray-100 text-gray-800'}`}>
                                  {task.subProject}
                                </span>
                              </div>
                              <div className="flex items-center mt-1.5 text-xs text-gray-500">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                <span>{task.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic">无任务</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};