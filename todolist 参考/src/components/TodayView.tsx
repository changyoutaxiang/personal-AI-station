import React from 'react';
import { MultiColumn } from './layout/MultiColumn';
import { CheckCircleIcon, ClockIcon, TrophyIcon, SparklesIcon } from 'lucide-react';

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

interface TodayViewProps {
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

export const TodayView: React.FC<TodayViewProps> = ({ tasks, onTaskClick }) => {
  // 按项目分组任务
  const projectsData = [
    { name: 'FSD', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === 'FSD') },
    { name: 'AIEC', subProjects: ['周会', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === 'AIEC') },
    { name: '训战营', subProjects: ['直播', '备课', '思考'], tasks: tasks.filter(t => t.projectName === '训战营') },
    { name: '管理会议', subProjects: ['会议', '思考'], tasks: tasks.filter(t => t.projectName === '管理会议') },
    { name: '组织赋能', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === '组织赋能') },
    { name: '其他', subProjects: ['会议', '沟通', '思考'], tasks: tasks.filter(t => t.projectName === '其他') }
  ].filter(project => project.tasks.length > 0);

  const getProjectColorClasses = (projectName: string, isExpanded: boolean) => {
    const color = projectColors[projectName] || 'gray';
    return {
      header: isExpanded ? `bg-${color}-50 border-l-4 border-${color}-500` : `bg-gray-50 border-l-4 border-${color}-300`,
      title: isExpanded ? `text-${color}-700` : 'text-gray-900'
    };
  };

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

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 mb-6">今日任务</h2>
      <MultiColumn minColumnWidth={280} maxColumns={5} gap={16}>
        {projectsData.map(project => {
          const colorClasses = getProjectColorClasses(project.name, expandedProjects[project.name]);
          return (
            <div key={project.name} className="macos-glass rounded-lg overflow-hidden flex flex-col h-full macos-shadow-window macos-hover-lift">
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
                <div className="p-4 bg-white flex-1">
                  <div className="space-y-4">
                    {project.subProjects.map(subProject => {
                      const subProjectTasks = project.tasks.filter(task => task.subProject === subProject);
                      if (subProjectTasks.length === 0) return null;
                      
                      return (
                        <div key={subProject} className="ml-2">
                          <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${subProjectColors[subProject] || 'bg-gray-100 text-gray-800'} mr-2`}>
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
                                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                          <div className="absolute -top-1 -right-1">
                                            <SparklesIcon className="w-3 h-3 text-yellow-500" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className={`w-5 h-5 rounded-full border-2 border-${color}-300`} />
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
                </div>
              )}
            </div>
          );
        })}
      </MultiColumn>
    </div>
  );
};