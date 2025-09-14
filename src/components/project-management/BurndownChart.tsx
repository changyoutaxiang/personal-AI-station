'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  Info,
  Download,
  Filter,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { format, addDays, differenceInDays, startOfDay, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ProjectTask } from '@/types/project-management';
import { TrelloCard } from '@/types/trello';

interface BurndownChartProps {
  tasks: (TrelloCard | ProjectTask)[];
  startDate: Date;
  endDate: Date;
  showIdealLine?: boolean;
  showActualLine?: boolean;
  showProjection?: boolean;
  showStatistics?: boolean;
  height?: number;
  onExport?: () => void;
}

interface BurndownData {
  date: string;
  day: number;
  ideal: number;
  actual: number;
  projected?: number;
  completed: number;
  remaining: number;
}

export function BurndownChart({
  tasks,
  startDate,
  endDate,
  showIdealLine = true,
  showActualLine = true,
  showProjection = true,
  showStatistics = true,
  height = 400,
  onExport,
}: BurndownChartProps) {
  const [viewMode, setViewMode] = useState<'points' | 'hours'>('points');
  const [filterType, setFilterType] = useState<'all' | 'story' | 'bug' | 'task'>('all');

  // 过滤任务
  const filteredTasks = useMemo(() => {
    if (filterType === 'all') return tasks;
    // 这里根据实际的任务类型字段进行过滤
    return tasks;
  }, [tasks, filterType]);

  // 计算燃尽图数据
  const burndownData = useMemo(() => {
    const data: BurndownData[] = [];
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // 计算总工作量
    const totalWork = viewMode === 'hours'
      ? filteredTasks.reduce((sum, task) => {
          const hours = 'estimatedHours' in task ? (task.estimatedHours || 8) : 8;
          return sum + hours;
        }, 0)
      : filteredTasks.length;

    // 为每一天生成数据点
    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const currentDate = addDays(startDate, dayIndex);
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      // 计算理想进度
      const idealRemaining = Math.max(0, totalWork - (totalWork / (totalDays - 1)) * dayIndex);

      // 计算实际完成情况
      const completedByDate = filteredTasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = task.completedAt || task.updatedAt;
        return completedDate && startOfDay(new Date(completedDate)) <= startOfDay(currentDate);
      });

      const actualCompleted = viewMode === 'hours'
        ? completedByDate.reduce((sum, task) => {
            const hours = 'estimatedHours' in task ? (task.estimatedHours || 8) : 8;
            return sum + hours;
          }, 0)
        : completedByDate.length;

      const actualRemaining = totalWork - actualCompleted;

      // 如果是今天或之后，计算预测值
      let projected: number | undefined;
      if (dayIndex > 0 && currentDate >= new Date()) {
        const completedSoFar = actualCompleted;
        const daysElapsed = dayIndex;
        const averageVelocity = daysElapsed > 0 ? completedSoFar / daysElapsed : 0;
        const daysRemaining = totalDays - dayIndex;
        const projectedCompletion = completedSoFar + (averageVelocity * daysRemaining);
        projected = Math.max(0, totalWork - projectedCompletion);
      }

      data.push({
        date: dateStr,
        day: dayIndex + 1,
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: Math.round(actualRemaining * 10) / 10,
        projected: projected !== undefined ? Math.round(projected * 10) / 10 : undefined,
        completed: Math.round(actualCompleted * 10) / 10,
        remaining: Math.round(actualRemaining * 10) / 10,
      });
    }

    return data;
  }, [filteredTasks, startDate, endDate, viewMode]);

  // 计算统计数据
  const statistics = useMemo(() => {
    const today = new Date();
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const elapsedDays = Math.max(0, Math.min(totalDays, differenceInDays(today, startDate) + 1));
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    const totalWork = viewMode === 'hours'
      ? filteredTasks.reduce((sum, task) => {
          const hours = 'estimatedHours' in task ? (task.estimatedHours || 8) : 8;
          return sum + hours;
        }, 0)
      : filteredTasks.length;

    const completedWork = viewMode === 'hours'
      ? filteredTasks.filter(t => t.completed).reduce((sum, task) => {
          const hours = 'estimatedHours' in task ? (task.estimatedHours || 8) : 8;
          return sum + hours;
        }, 0)
      : filteredTasks.filter(t => t.completed).length;

    const remainingWork = totalWork - completedWork;
    const averageVelocity = elapsedDays > 0 ? completedWork / elapsedDays : 0;
    const projectedDaysToComplete = averageVelocity > 0 ? remainingWork / averageVelocity : remainingDays;
    const projectedCompletionDate = addDays(today, Math.ceil(projectedDaysToComplete));

    // 计算进度偏差
    const idealProgress = elapsedDays / totalDays * 100;
    const actualProgress = (completedWork / totalWork) * 100;
    const progressVariance = actualProgress - idealProgress;

    return {
      totalWork,
      completedWork,
      remainingWork,
      totalDays,
      elapsedDays,
      remainingDays,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      projectedCompletionDate,
      progressVariance: Math.round(progressVariance * 10) / 10,
      actualProgress: Math.round(actualProgress * 10) / 10,
      idealProgress: Math.round(idealProgress * 10) / 10,
      isOnTrack: progressVariance >= -5,
      estimatedDelay: Math.max(0, Math.ceil(projectedDaysToComplete - remainingDays)),
    };
  }, [filteredTasks, startDate, endDate, viewMode]);

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2">
            第 {data.day} 天 ({format(new Date(data.date), 'MM月dd日', { locale: zhCN })})
          </p>
          <div className="space-y-1 text-sm">
            {showIdealLine && (
              <p className="text-gray-600">
                理想剩余: <span className="font-medium">{data.ideal}</span> {viewMode === 'hours' ? '小时' : '点'}
              </p>
            )}
            {showActualLine && (
              <p className="text-blue-600">
                实际剩余: <span className="font-medium">{data.actual}</span> {viewMode === 'hours' ? '小时' : '点'}
              </p>
            )}
            {showProjection && data.projected !== undefined && (
              <p className="text-orange-600">
                预测剩余: <span className="font-medium">{data.projected}</span> {viewMode === 'hours' ? '小时' : '点'}
              </p>
            )}
            <p className="text-green-600">
              已完成: <span className="font-medium">{data.completed}</span> {viewMode === 'hours' ? '小时' : '点'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 自定义点样式
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isToday = isSameDay(new Date(payload.date), new Date());

    if (isToday) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#3B82F6" />
          <circle cx={cx} cy={cy} r={3} fill="white" />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 头部工具栏 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2" />
              燃尽图
            </h3>

            {/* 视图模式切换 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('points')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'points'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                故事点
              </button>
              <button
                onClick={() => setViewMode('hours')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'hours'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                工时
              </button>
            </div>

            {/* 过滤器 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="all">全部任务</option>
                <option value="story">用户故事</option>
                <option value="bug">缺陷</option>
                <option value="task">任务</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExport}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="导出图表"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
              label={{ value: '天数', position: 'insideBottom', offset: -5 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
              label={{
                value: viewMode === 'hours' ? '剩余工时' : '剩余故事点',
                angle: -90,
                position: 'insideLeft',
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              wrapperStyle={{ fontSize: '14px' }}
            />

            {/* 理想线 */}
            {showIdealLine && (
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="理想进度"
              />
            )}

            {/* 实际线 */}
            {showActualLine && (
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
                dot={<CustomDot />}
                name="实际进度"
              />
            )}

            {/* 预测线 */}
            {showProjection && (
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#F97316"
                strokeWidth={2}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#colorProjected)"
                dot={false}
                name="预测进度"
              />
            )}

            {/* 今日标记线 */}
            <ReferenceLine
              x={differenceInDays(new Date(), startDate) + 1}
              stroke="#10B981"
              strokeWidth={2}
              label={{ value: '今天', position: 'top' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 统计信息 */}
      {showStatistics && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 进度状态 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {statistics.isOnTrack ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-700">进度状态</span>
              </div>
              <p className={`text-lg font-bold ${statistics.isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.isOnTrack ? '正常' : '落后'}
              </p>
              <p className="text-xs text-gray-500">
                偏差: {statistics.progressVariance > 0 ? '+' : ''}{statistics.progressVariance}%
              </p>
            </div>

            {/* 完成进度 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">完成进度</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {statistics.actualProgress}%
              </p>
              <p className="text-xs text-gray-500">
                {statistics.completedWork}/{statistics.totalWork} {viewMode === 'hours' ? '小时' : '点'}
              </p>
            </div>

            {/* 平均速度 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">平均速度</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {statistics.averageVelocity}
              </p>
              <p className="text-xs text-gray-500">
                {viewMode === 'hours' ? '小时' : '点'}/天
              </p>
            </div>

            {/* 预计完成 */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">预计完成</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {format(statistics.projectedCompletionDate, 'MM/dd', { locale: zhCN })}
              </p>
              <p className="text-xs text-gray-500">
                {statistics.estimatedDelay > 0 ? (
                  <span className="text-red-500">延期 {statistics.estimatedDelay} 天</span>
                ) : (
                  <span className="text-green-500">按时完成</span>
                )}
              </p>
            </div>
          </div>

          {/* 提示信息 */}
          {!statistics.isOnTrack && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">进度提醒</p>
                  <p>
                    当前进度落后于计划 {Math.abs(statistics.progressVariance)}%。
                    按照当前速度，项目预计将延期 {statistics.estimatedDelay} 天完成。
                    建议增加资源投入或调整项目范围。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 说明 */}
          <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p>燃尽图展示了项目剩余工作量随时间的变化趋势。</p>
              <p>灰色虚线表示理想进度，蓝色区域表示实际进度，橙色区域表示基于当前速度的预测进度。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}