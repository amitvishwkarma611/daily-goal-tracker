export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskTimeSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type GoalCategory = 'Career' | 'Health' | 'Learning' | 'Personal' | 'Focus';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string; // YYYY-MM-DD
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  goalId?: string; // Optional link to a Goal
  title: string;
  notes?: string;
  priority: TaskPriority;
  timeSlot: TaskTimeSlot;
  estimatedMinutes: number;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface DailyProductivityRecord {
  date: string; // YYYY-MM-DD
  focusRating: number; // 1-5
  notes: string;
  wins: string[];
  obstacles?: string;
  updatedAt: string;
}

export interface FilterState {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
  category: string; // 'all' or goal category
  searchQuery: string;
  groupBy: 'none' | 'priority' | 'timeSlot' | 'goal';
}

export interface DayProgress {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
  totalMinutes: number;
  completedMinutes: number;
  highPriorityTotal: number;
  highPriorityCompleted: number;
  mediumPriorityTotal: number;
  mediumPriorityCompleted: number;
  lowPriorityTotal: number;
  lowPriorityCompleted: number;
}

export interface WeeklyDayStat {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  dayNumber: number; // 1-31
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  isToday: boolean;
  isSelected: boolean;
}

export interface MonthlyDayStat {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ...
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export interface MonthlyOverview {
  monthName: string;
  year: number;
  days: MonthlyDayStat[];
  avgCompletionRate: number;
  totalCompletedTasks: number;
  totalPlannedTasks: number;
  perfectDaysCount: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalProductiveDays: number;
}
