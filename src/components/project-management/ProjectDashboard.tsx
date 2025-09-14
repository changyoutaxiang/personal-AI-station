'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  FileText,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { format, differenceInDays, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Project, ProjectMetrics, Risk, Issue, Milestone } from '@/types/project-management';
import { TrelloBoard, TrelloCard } from '@/types/trello';

interface ProjectDashboardProps {
  project: Project | TrelloBoard;
  cards?: TrelloCard[];
  onViewDetails?: (section: string) => void;
}

export function ProjectDashboard({ project, cards = [], onViewDetails }: ProjectDashboardProps) {
  // 判断是否是项目类型
  const isProject = 'projectType' in project;

  // 计算基础统计数据
  const stats = useMemo(() => {
    const totalTasks = cards.length;
    const completedTasks = cards.filter(c => c.completed).length;
    const inProgressTasks = cards.filter(c => !c.completed && c.actualStartDate).length;
    const notStartedTasks = totalTasks - completedTasks - inProgressTasks;

    const overdueTasks = cards.filter(c => {
      return c.dueDate && new Date(c.dueDate) < new Date() && !c.completed;
    }).length;

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 计算预算（如果有）
    const totalBudget = isProject ? project.budget?.total || 0 : 0;
    const spentBudget = isProject ? project.budget?.spent || 0 : 0;
    const budgetProgress = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

    // 计算时间进度
    const startDate = isProject && project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const endDate = isProject && project.endDate ? new Date(project.endDate) : addDays(startDate, 90);
    const today = new Date();
    const totalDays = differenceInDays(endDate, startDate);
    const elapsedDays = differenceInDays(today, startDate);
    const timeProgress = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

    // 风险统计
    const risks = isProject ? project.risks || [] : [];
    const highRisks = risks.filter(r => r.probability >= 4 || r.impact >= 4).length;
    const activeRisks = risks.filter(r => r.status !== 'closed').length;

    // 问题统计
    const issues = isProject ? project.issues || [] : [];
    const criticalIssues = issues.filter(i => i.severity === 'blocker' || i.severity === 'critical').length;
    const openIssues = issues.filter(i => i.status === 'open' || i.status === 'in-progress').length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      overdueTasks,
      progress,
      totalBudget,
      spentBudget,
      budgetProgress,
      startDate,
      endDate,
      totalDays,
      elapsedDays,
      timeProgress,
      highRisks,
      activeRisks,
      criticalIssues,
      openIssues,
    };
  }, [project, cards, isProject]);

  // 准备图表数据
  const taskStatusData = [
    { name: '未开始', value: stats.notStartedTasks, color: '#9CA3AF' },
    { name: '进行中', value: stats.inProgressTasks, color: '#3B82F6' },
    { name: '已完成', value: stats.completedTasks, color: '#10B981' },
    { name: '逾期', value: stats.overdueTasks, color: '#EF4444' },
  ];

  // 燃尽图数据（模拟）
  const burndownData = useMemo(() => {
    const data = [];
    const totalWork = stats.totalTasks;
    const daysCount = Math.min(30, stats.totalDays);

    for (let i = 0; i <= daysCount; i++) {
      const date = addDays(stats.startDate, i);
      const ideal = totalWork - (totalWork / daysCount) * i;
      const actual = totalWork - Math.floor(Math.random() * i * (totalWork / daysCount));

      data.push({
        day: format(date, 'MM/dd'),
        ideal: Math.round(ideal),
        actual: Math.round(actual),
      });
    }

    return data;
  }, [stats]);

  // 资源利用率数据（模拟）
  const resourceData = [
    { name: '开发', utilization: 85, capacity: 100 },
    { name: '设计', utilization: 70, capacity: 100 },
    { name: '测试', utilization: 60, capacity: 100 },
    { name: '产品', utilization: 90, capacity: 100 },
  ];

  // 健康评分
  const healthScore = useMemo(() => {
    let score = 100;

    // 进度偏差
    const scheduleVariance = stats.progress - stats.timeProgress;
    if (scheduleVariance < -10) score -= 20;
    else if (scheduleVariance < -5) score -= 10;

    // 逾期任务
    if (stats.overdueTasks > 0) {
      score -= Math.min(20, stats.overdueTasks * 5);
    }

    // 高风险
    if (stats.highRisks > 0) {
      score -= Math.min(15, stats.highRisks * 5);
    }

    // 关键问题
    if (stats.criticalIssues > 0) {
      score -= Math.min(15, stats.criticalIssues * 5);
    }

    // 预算超支
    if (stats.budgetProgress > 100) {
      score -= 20;
    }

    return Math.max(0, score);
  }, [stats]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return '健康';
    if (score >= 60) return '一般';
    if (score >= 40) return '风险';
    return '危险';
  };

  return (
    <div className="space-y-6">
      {/* 顶部概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 项目健康度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">项目健康度</span>
            </div>
            <span className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">状态</span>
              <span className={`text-sm font-medium ${getHealthColor(healthScore)}`}>
                {getHealthLabel(healthScore)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  healthScore >= 80 ? 'bg-green-500' :
                  healthScore >= 60 ? 'bg-yellow-500' :
                  healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* 进度概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">完成进度</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.progress}%</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">任务: {stats.completedTasks}/{stats.totalTasks}</span>
              <span className="text-gray-500">时间: {stats.timeProgress}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <div
                className="absolute top-0 w-0.5 h-2 bg-red-500"
                style={{ left: `${stats.timeProgress}%` }}
              />
            </div>
            {stats.progress < stats.timeProgress && (
              <p className="text-xs text-orange-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                进度落后于计划
              </p>
            )}
          </div>
        </motion.div>

        {/* 预算状态 */}
        {isProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">预算使用</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.budgetProgress}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  已用: ¥{stats.spentBudget.toLocaleString()}
                </span>
                <span className="text-gray-500">
                  总额: ¥{stats.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    stats.budgetProgress > 90 ? 'bg-red-500' :
                    stats.budgetProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, stats.budgetProgress)}%` }}
                />
              </div>
              {stats.budgetProgress > 90 && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  预算即将耗尽
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 风险和问题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">风险与问题</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">高风险</span>
              <span className={`text-sm font-bold ${stats.highRisks > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.highRisks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">活跃风险</span>
              <span className="text-sm font-bold text-yellow-500">{stats.activeRisks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">关键问题</span>
              <span className={`text-sm font-bold ${stats.criticalIssues > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.criticalIssues}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">待解决</span>
              <span className="text-sm font-bold text-blue-500">{stats.openIssues}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 燃尽图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">燃尽图</h3>
            <button
              onClick={() => onViewDetails?.('burndown')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              查看详情
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="ideal"
                stroke="#9CA3AF"
                fill="none"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="理想进度"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                fill="#DBEAFE"
                strokeWidth={2}
                name="实际进度"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 任务分布 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">任务分布</h3>
            <button
              onClick={() => onViewDetails?.('tasks')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              查看详情
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {taskStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 资源利用率 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">资源利用率</h3>
            <button
              onClick={() => onViewDetails?.('resources')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              查看详情
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="utilization" fill="#3B82F6" name="利用率(%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {resourceData.map((resource) => (
              <div key={resource.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{resource.name}</span>
                <span className={`text-sm font-medium ${
                  resource.utilization > 90 ? 'text-red-500' :
                  resource.utilization > 75 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {resource.utilization}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 里程碑进度 */}
        {isProject && project.milestones && project.milestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">里程碑进度</h3>
              <button
                onClick={() => onViewDetails?.('milestones')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                查看详情
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="space-y-3">
              {project.milestones.slice(0, 5).map((milestone) => {
                const daysRemaining = differenceInDays(new Date(milestone.targetDate), new Date());
                const isOverdue = daysRemaining < 0 && milestone.status !== 'completed';

                return (
                  <div key={milestone.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        isOverdue ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{milestone.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(milestone.targetDate), 'yyyy年MM月dd日', { locale: zhCN })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : isOverdue ? (
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-red-500">逾期{Math.abs(daysRemaining)}天</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">剩余{daysRemaining}天</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* 关键指标 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">关键绩效指标</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalTasks}</div>
            <div className="text-sm text-gray-600 mt-1">总任务数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
            <div className="text-sm text-gray-600 mt-1">已完成</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgressTasks}</div>
            <div className="text-sm text-gray-600 mt-1">进行中</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.overdueTasks}</div>
            <div className="text-sm text-gray-600 mt-1">已逾期</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}