// 项目管理功能的完整类型定义系统
// 扩展现有的 Trello 功能，增加经典项目管理能力

import { TrelloBoard, TrelloCard, TrelloList, Member, Priority } from './trello';

// ==================== 核心项目类型 ====================

export interface Project extends TrelloBoard {
  // 项目基础信息
  projectCode: string;
  projectType: ProjectType;
  status: ProjectStatus;
  phase: ProjectPhase;

  // 时间管理
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  baselineStartDate?: Date;
  baselineEndDate?: Date;

  // 预算管理
  budget: Budget;
  actualCost: number;

  // 团队管理
  projectManager: Member;
  stakeholders: Stakeholder[];
  team: TeamMember[];

  // 项目规划
  milestones: Milestone[];
  deliverables: Deliverable[];
  risks: Risk[];
  issues: Issue[];

  // 项目度量
  metrics: ProjectMetrics;
  healthScore: ProjectHealth;

  // 文档管理
  documents: ProjectDocument[];
  charter?: ProjectCharter;

  // 依赖关系
  dependencies: ProjectDependency[];
  parentProjectId?: string;
  subProjectIds: string[];
}

// ==================== 项目枚举类型 ====================

export type ProjectType =
  | 'software'
  | 'construction'
  | 'marketing'
  | 'research'
  | 'product'
  | 'service'
  | 'other';

export type ProjectStatus =
  | 'planning'
  | 'initiated'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'cancelled';

export type ProjectPhase =
  | 'initiation'
  | 'planning'
  | 'execution'
  | 'monitoring'
  | 'closing';

export type ProjectHealth =
  | 'healthy'
  | 'at-risk'
  | 'critical'
  | 'completed';

// ==================== 时间管理 ====================

export interface ProjectTask extends TrelloCard {
  // 任务计划
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // 工作量估算
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  percentComplete: number;

  // 任务依赖
  predecessors: TaskDependency[];
  successors: TaskDependency[];

  // 资源分配
  assignedResources: ResourceAssignment[];

  // 任务属性
  taskType?: 'task' | 'milestone' | 'summary'; // 覆盖 TrelloCard 的类型
  extendedTaskType?: TaskType; // 额外的任务类型
  isCriticalPath: boolean;
  isMilestone: boolean;

  // 成本
  plannedCost: number;
  actualCost: number;
}

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  lag: number; // 延迟天数（可为负）
}

export type DependencyType =
  | 'finish-to-start'    // FS: 前置任务完成后才能开始
  | 'start-to-start'     // SS: 同时开始
  | 'finish-to-finish'   // FF: 同时结束
  | 'start-to-finish';   // SF: 前置任务开始后才能结束

export type TaskType =
  | 'task'
  | 'milestone'
  | 'summary'
  | 'deliverable';

// ==================== 里程碑管理 ====================

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  deliverables: string[]; // Deliverable IDs
  criteria: string[];
  owner: Member;
  impact: 'critical' | 'major' | 'minor';
}

export type MilestoneStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

// ==================== 资源管理 ====================

export interface TeamMember extends Member {
  role: ProjectRole;
  allocation: number; // 分配百分比 (0-100)
  availability: Availability[];
  skills: Skill[];
  costPerHour: number;
  department: string;
  reportingTo?: string; // Manager ID
}

export interface ProjectRole {
  id: string;
  name: string;
  responsibilities: string[];
  requiredSkills: string[];
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'manager';
}

export interface Availability {
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
}

export interface ResourceAssignment {
  resourceId: string;
  taskId: string;
  allocation: number; // 百分比
  startDate: Date;
  endDate: Date;
  actualHours: number;
  role: string;
}

// ==================== 预算管理 ====================

export interface Budget {
  total: number;
  allocated: number;
  spent: number;
  categories: BudgetCategory[];
  currency: string;
  approvedBy: string;
  approvalDate: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  type: 'labor' | 'material' | 'equipment' | 'external' | 'contingency' | 'other';
  description: string;
}

// ==================== 风险管理 ====================

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: RiskLevel;
  impact: RiskLevel;
  score: number; // probability * impact
  status: RiskStatus;
  owner: Member;
  identifiedDate: Date;
  targetResolutionDate?: Date;
  actualResolutionDate?: Date;

  // 风险应对
  response: RiskResponse;
  mitigationPlan: string;
  contingencyPlan: string;
  trigger: string;

  // 影响分析
  affectedTasks: string[];
  affectedMilestones: string[];
  costImpact: number;
  scheduleImpact: number; // 天数
}

export type RiskCategory =
  | 'technical'
  | 'schedule'
  | 'budget'
  | 'resource'
  | 'scope'
  | 'quality'
  | 'external';

export type RiskLevel = 1 | 2 | 3 | 4 | 5; // 1=非常低, 5=非常高

export type RiskStatus =
  | 'identified'
  | 'analyzing'
  | 'mitigating'
  | 'monitoring'
  | 'closed'
  | 'occurred';

export type RiskResponse =
  | 'avoid'
  | 'transfer'
  | 'mitigate'
  | 'accept';

// ==================== 问题管理 ====================

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  reporter: Member;
  assignee: Member;
  reportedDate: Date;
  targetResolutionDate: Date;
  actualResolutionDate?: Date;

  // 影响和解决
  impactDescription: string;
  resolution?: string;
  rootCause?: string;
  preventiveMeasures?: string;

  // 关联
  relatedRisks: string[];
  affectedTasks: string[];
  blockedTasks: string[];
}

export type IssueCategory =
  | 'technical'
  | 'process'
  | 'people'
  | 'external'
  | 'quality'
  | 'communication';

export type IssueSeverity =
  | 'blocker'
  | 'critical'
  | 'major'
  | 'minor'
  | 'trivial';

export type IssueStatus =
  | 'open'
  | 'in-progress'
  | 'resolved'
  | 'closed'
  | 'reopened';

// ==================== 交付物管理 ====================

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  type: DeliverableType;
  milestoneId?: string;

  // 状态跟踪
  status: DeliverableStatus;
  completionPercentage: number;

  // 时间管理
  plannedDeliveryDate: Date;
  actualDeliveryDate?: Date;

  // 质量管理
  acceptanceCriteria: string[];
  qualityMetrics: QualityMetric[];
  approver: Member;
  approvalStatus?: ApprovalStatus;
  approvalDate?: Date;

  // 关联
  dependencies: string[]; // 其他交付物ID
  relatedTasks: string[];
}

export type DeliverableType =
  | 'document'
  | 'software'
  | 'hardware'
  | 'service'
  | 'report'
  | 'training'
  | 'other';

export type DeliverableStatus =
  | 'not-started'
  | 'in-progress'
  | 'review'
  | 'approved'
  | 'delivered';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'conditional';

// ==================== 项目度量 ====================

export interface ProjectMetrics {
  // 进度指标
  schedulePerformance: ScheduleMetrics;

  // 成本指标
  costPerformance: CostMetrics;

  // 质量指标
  qualityMetrics: QualityMetrics;

  // 团队指标
  teamMetrics: TeamMetrics;

  // 风险指标
  riskMetrics: RiskMetrics;

  // 计算时间
  lastUpdated: Date;
}

export interface ScheduleMetrics {
  plannedValue: number;      // PV: 计划价值
  earnedValue: number;        // EV: 挣值
  scheduleVariance: number;   // SV = EV - PV
  schedulePerformanceIndex: number; // SPI = EV / PV
  estimatedCompletion: Date;
  criticalPathTasks: string[];
  delayedTasks: number;
  completedTasks: number;
  totalTasks: number;
}

export interface CostMetrics {
  actualCost: number;         // AC: 实际成本
  earnedValue: number;        // EV: 挣值
  costVariance: number;       // CV = EV - AC
  costPerformanceIndex: number; // CPI = EV / AC
  estimateAtCompletion: number; // EAC
  estimateToComplete: number;   // ETC
  budgetAtCompletion: number;   // BAC
}

export interface QualityMetrics {
  defectDensity: number;
  testCoverage: number;
  customerSatisfaction: number;
  deliverableQuality: number;
  reworkPercentage: number;
}

export interface TeamMetrics {
  teamVelocity: number;
  resourceUtilization: number;
  overtimeHours: number;
  teamMorale: number;
  turnoverRate: number;
}

export interface RiskMetrics {
  totalRisks: number;
  activeRisks: number;
  highPriorityRisks: number;
  averageResolutionTime: number;
  riskExposure: number;
}

// ==================== 甘特图数据结构 ====================

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  project?: string;
  hideChildren?: boolean;
  isDisabled?: boolean;
  styles?: {
    progressColor?: string;
    progressSelectedColor?: string;
    backgroundColor?: string;
    backgroundSelectedColor?: string;
  };
}

export interface GanttViewOptions {
  viewMode: ViewMode;
  locale: string;
  rtl: boolean;
}

export type ViewMode =
  | 'Hour'
  | 'QuarterDay'
  | 'HalfDay'
  | 'Day'
  | 'Week'
  | 'Month'
  | 'Year';

// ==================== 报告和文档 ====================

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  version: string;
  url?: string;
  content?: string;
  author: Member;
  createdDate: Date;
  lastModified: Date;
  tags: string[];
}

export type DocumentType =
  | 'charter'
  | 'plan'
  | 'report'
  | 'specification'
  | 'design'
  | 'manual'
  | 'presentation'
  | 'other';

export interface ProjectCharter {
  projectName: string;
  projectPurpose: string;
  businessCase: string;
  objectives: string[];
  scope: ProjectScope;
  constraints: string[];
  assumptions: string[];
  successCriteria: string[];
  approvers: Member[];
  approvalDate?: Date;
}

export interface ProjectScope {
  inScope: string[];
  outOfScope: string[];
  deliverables: string[];
  boundaries: string[];
}

// ==================== 利益相关者管理 ====================

export interface Stakeholder extends Member {
  type: StakeholderType;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  attitude: 'champion' | 'supporter' | 'neutral' | 'critic' | 'blocker';
  communicationPreference: CommunicationPreference;
  engagementStrategy: string;
}

export type StakeholderType =
  | 'sponsor'
  | 'customer'
  | 'end-user'
  | 'team-member'
  | 'vendor'
  | 'regulator'
  | 'other';

export interface CommunicationPreference {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as-needed';
  method: 'email' | 'meeting' | 'report' | 'dashboard' | 'phone';
  detail: 'summary' | 'detailed' | 'technical';
}

// ==================== 项目依赖 ====================

export interface ProjectDependency {
  id: string;
  type: 'internal' | 'external';
  name: string;
  description: string;
  source: string; // 项目或外部来源
  target: string; // 依赖的项目或任务
  status: 'pending' | 'in-progress' | 'resolved' | 'blocked';
  criticalPath: boolean;
  owner: Member;
  dueDate: Date;
}

// ==================== 质量管理 ====================

export interface QualityMetric {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  threshold: {
    min?: number;
    max?: number;
  };
  status: 'pass' | 'fail' | 'warning';
  measurementDate: Date;
}

// ==================== 仪表板配置 ====================

export interface DashboardConfig {
  layout: DashboardLayout[];
  refreshInterval: number; // 秒
  theme: 'light' | 'dark';
  filters: DashboardFilter[];
}

export interface DashboardLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
}

export type WidgetType =
  | 'project-summary'
  | 'gantt-chart'
  | 'burndown-chart'
  | 'risk-matrix'
  | 'team-workload'
  | 'milestone-timeline'
  | 'budget-tracker'
  | 'issue-tracker';

export interface DashboardFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

// ==================== 导出功能 ====================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'ms-project';
  includeCharts: boolean;
  includeAttachments: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sections: ExportSection[];
}

export type ExportSection =
  | 'summary'
  | 'schedule'
  | 'budget'
  | 'resources'
  | 'risks'
  | 'issues'
  | 'milestones'
  | 'reports';