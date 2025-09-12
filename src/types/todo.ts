export type Priority = 'high' | 'medium' | 'low';
export type Category = 'work' | 'life' | 'study' | 'health' | 'other';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  tags: Category[];
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  timeRange?: TimeRange;
  estimatedTime?: number; // in minutes
  repeatType: RepeatType;
  category: 'today' | 'week';
  subTasks: SubTask[];
  order?: number;
}

export interface PomodoroSession {
  id: string;
  todoId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  completed: boolean;
}

// Theme types for Todo functionality
export type Theme = 'sunset' | 'ocean' | 'forest' | 'galaxy' | 'candy';

// OKR types
export interface KeyResult {
  id: string;
  text: string;
  completed: boolean;
}

export interface OKRGoal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  keyResults: KeyResult[];
}
