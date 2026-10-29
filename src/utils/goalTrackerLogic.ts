import {
  Task,
  Goal,
  DayProgress,
  FilterState,
  WeeklyDayStat,
  MonthlyOverview,
  MonthlyDayStat,
  StreakStats,
  TaskPriority,
} from '../types';

/**
 * Calculates progress for a set of tasks on a given day.
 */
export function calculateDayProgress(tasks: Task[]): DayProgress {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      remaining: 0,
      percentage: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      highPriorityTotal: 0,
      highPriorityCompleted: 0,
      mediumPriorityTotal: 0,
      mediumPriorityCompleted: 0,
      lowPriorityTotal: 0,
      lowPriorityCompleted: 0,
    };
  }

  let completed = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;
  let highPriorityTotal = 0;
  let highPriorityCompleted = 0;
  let mediumPriorityTotal = 0;
  let mediumPriorityCompleted = 0;
  let lowPriorityTotal = 0;
  let lowPriorityCompleted = 0;

  for (const t of tasks) {
    totalMinutes += t.estimatedMinutes || 0;
    if (t.priority === 'high') {
      highPriorityTotal++;
      if (t.completed) highPriorityCompleted++;
    } else if (t.priority === 'medium') {
      mediumPriorityTotal++;
      if (t.completed) mediumPriorityCompleted++;
    } else {
      lowPriorityTotal++;
      if (t.completed) lowPriorityCompleted++;
    }

    if (t.completed) {
      completed++;
      completedMinutes += t.estimatedMinutes || 0;
    }
  }

  const remaining = total - completed;
  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    remaining,
    percentage,
    totalMinutes,
    completedMinutes,
    highPriorityTotal,
    highPriorityCompleted,
    mediumPriorityTotal,
    mediumPriorityCompleted,
    lowPriorityTotal,
    lowPriorityCompleted,
  };
}

/**
 * Filter tasks according to filter criteria and keyword search.
 */
export function filterTasks(
  tasks: Task[],
  filter: FilterState,
  goalsMap: Map<string, Goal>
): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filter.status === 'pending' && task.completed) return false;
    if (filter.status === 'completed' && !task.completed) return false;

    // Priority filter
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;

    // Category filter
    if (filter.category !== 'all') {
      if (!task.goalId) return false;
      const goal = goalsMap.get(task.goalId);
      if (!goal || goal.category !== filter.category) return false;
    }

    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(q);
      const notesMatch = task.notes ? task.notes.toLowerCase().includes(q) : false;
      const goalMatch = task.goalId && goalsMap.get(task.goalId)?.title.toLowerCase().includes(q);
      if (!titleMatch && !notesMatch && !goalMatch) return false;
    }

    return true;
  });
}

/**
 * Group tasks by chosen key.
 */
export function groupTasks(
  tasks: Task[],
  groupBy: 'none' | 'priority' | 'timeSlot' | 'goal',
  goalsMap: Map<string, Goal>
): { groupName: string; tasks: Task[] }[] {
  if (groupBy === 'none') {
    return [{ groupName: 'All Tasks', tasks }];
  }

  if (groupBy === 'priority') {
    const order: TaskPriority[] = ['high', 'medium', 'low'];
    const labels: Record<TaskPriority, string> = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    };
    return order
      .map((pri) => ({
        groupName: labels[pri],
        tasks: tasks.filter((t) => t.priority === pri),
      }))
      .filter((g) => g.tasks.length > 0);
  }

  if (groupBy === 'timeSlot') {
    const slots = ['morning', 'afternoon', 'evening', 'anytime'] as const;
    const labels: Record<string, string> = {
      morning: 'Morning Focus',
      afternoon: 'Afternoon Flow',
      evening: 'Evening Wind-down',
      anytime: 'Flexible / Anytime',
    };
    return slots
      .map((slot) => ({
        groupName: labels[slot],
        tasks: tasks.filter((t) => t.timeSlot === slot),
      }))
      .filter((g) => g.tasks.length > 0);
  }

  if (groupBy === 'goal') {
    const groups: { groupName: string; tasks: Task[] }[] = [];
    const assignedByGoal = new Map<string, Task[]>();
    const standaloneTasks: Task[] = [];

    for (const t of tasks) {
      if (t.goalId && goalsMap.has(t.goalId)) {
        const list = assignedByGoal.get(t.goalId) || [];
        list.push(t);
        assignedByGoal.set(t.goalId, list);
      } else {
        standaloneTasks.push(t);
      }
    }

    goalsMap.forEach((goal, id) => {
      const gTasks = assignedByGoal.get(id);
      if (gTasks && gTasks.length > 0) {
        groups.push({
          groupName: goal.title,
          tasks: gTasks,
        });
      }
    });

    if (standaloneTasks.length > 0) {
      groups.push({
        groupName: 'General Daily Tasks',
        tasks: standaloneTasks,
      });
    }

    return groups;
  }

  return [{ groupName: 'Tasks', tasks }];
}

/**
 * Calculates a 7-day weekly stats array around the selected date (Monday to Sunday).
 */
export function calculateWeeklyProgress(
  allTasks: Task[],
  selectedDateStr: string,
  todayStr: string
): WeeklyDayStat[] {
  const selectedDate = new Date(selectedDateStr + 'T00:00:00');
  // Find Monday of the current week (assuming Monday is start of week)
  const day = selectedDate.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() + diffToMonday);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result: WeeklyDayStat[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayTasks = allTasks.filter((t) => t.date === dateStr);
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    result.push({
      date: dateStr,
      dayLabel: dayLabels[i],
      dayNumber: d.getDate(),
      totalTasks: total,
      completedTasks: completed,
      percentage,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDateStr,
    });
  }

  return result;
}

/**
 * Calculates a monthly overview including all days for calendar heatmap.
 */
export function calculateMonthlyOverview(
  allTasks: Task[],
  selectedDateStr: string,
  todayStr: string
): MonthlyOverview {
  const selectedDate = new Date(selectedDateStr + 'T00:00:00');
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const days: MonthlyDayStat[] = [];
  let totalTasksSum = 0;
  let totalCompletedSum = 0;
  let daysWithTasks = 0;
  let percentageSum = 0;
  let perfectDaysCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = allTasks.filter((t) => t.date === dateStr);
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (total > 0) {
      totalTasksSum += total;
      totalCompletedSum += completed;
      daysWithTasks++;
      percentageSum += percentage;
      if (percentage === 100) {
        perfectDaysCount++;
      }
    }

    days.push({
      date: dateStr,
      dayNumber: day,
      dayOfWeek: d.getDay(),
      totalTasks: total,
      completedTasks: completed,
      percentage,
      inCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  const avgCompletionRate = daysWithTasks > 0 ? Math.round(percentageSum / daysWithTasks) : 0;

  return {
    monthName: monthNames[month],
    year,
    days,
    avgCompletionRate,
    totalCompletedTasks: totalCompletedSum,
    totalPlannedTasks: totalTasksSum,
    perfectDaysCount,
  };
}

/**
 * Calculates productivity streaks (current active streak and longest streak).
 * A day is considered productive if at least one task was planned and at least 50% completed.
 */
export function calculateStreakStats(
  allTasks: Task[],
  todayStr: string
): StreakStats {
  // Collect all unique dates with tasks
  const dateMap = new Map<string, { total: number; completed: number }>();
  for (const t of allTasks) {
    const current = dateMap.get(t.date) || { total: 0, completed: 0 };
    current.total++;
    if (t.completed) current.completed++;
    dateMap.set(t.date, current);
  }

  const isProductiveDay = (dateStr: string): boolean => {
    const entry = dateMap.get(dateStr);
    if (!entry || entry.total === 0) return false;
    return entry.completed / entry.total >= 0.5; // At least 50% completed
  };

  // Calculate current streak backward from today (or yesterday if today has not completed tasks yet)
  let currentStreak = 0;
  const todayEntry = dateMap.get(todayStr);
  let cursor = new Date(todayStr + 'T00:00:00');

  // If today is productive, start from today.
  // If today has pending tasks or no tasks yet, check if yesterday was productive to preserve streak!
  if (isProductiveDay(todayStr)) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  } else if (todayEntry && todayEntry.completed === 0 && todayEntry.total > 0) {
    // Today tasks not completed yet, check if yesterday was productive
    cursor.setDate(cursor.getDate() - 1);
  } else if (!todayEntry) {
    // No tasks planned today yet, check from yesterday
    cursor.setDate(cursor.getDate() - 1);
  } else {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (isProductiveDay(dateStr)) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak by sorting all dates
  const sortedDates = Array.from(dateMap.keys()).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  let totalProductiveDays = 0;

  for (const dateStr of sortedDates) {
    if (isProductiveDay(dateStr)) {
      totalProductiveDays++;
      const curDate = new Date(dateStr + 'T00:00:00');
      if (lastDate) {
        const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      lastDate = curDate;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    totalProductiveDays,
  };
}

/**
 * Format date for friendly human display (e.g. "Today, Oct 29, 2026", "Yesterday", or "Wednesday, Oct 28")
 */
export function formatHeaderDate(dateStr: string, todayStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const formatted = date.toLocaleDateString('en-US', options);

  if (diffDays === 0) return `Today, ${formatted}`;
  if (diffDays === -1) return `Yesterday, ${formatted}`;
  if (diffDays === 1) return `Tomorrow, ${formatted}`;

  return formatted;
}
