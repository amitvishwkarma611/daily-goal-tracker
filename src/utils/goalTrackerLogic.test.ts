import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDayProgress,
  filterTasks,
  groupTasks,
  calculateWeeklyProgress,
  calculateMonthlyOverview,
  calculateStreakStats,
  formatHeaderDate,
} from './goalTrackerLogic';
import { Task, Goal, FilterState } from '../types';

const mockGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Career Sprint',
    description: 'Advance engineering goals',
    category: 'Career',
    targetDate: '2026-11-30',
    color: '#3b82f6',
    createdAt: '2026-10-01',
  },
  {
    id: 'g2',
    title: 'Health & Endurance',
    description: 'Cardio and clean nutrition',
    category: 'Health',
    targetDate: '2026-12-31',
    color: '#10b981',
    createdAt: '2026-10-01',
  },
];

const mockGoalsMap = new Map<string, Goal>([
  ['g1', mockGoals[0]],
  ['g2', mockGoals[1]],
]);

const mockTasks: Task[] = [
  {
    id: 't1',
    goalId: 'g1',
    title: 'Design API Schema',
    notes: 'Draft endpoints in openapi spec',
    priority: 'high',
    timeSlot: 'morning',
    estimatedMinutes: 60,
    date: '2026-10-29',
    completed: true,
    createdAt: '2026-10-29T07:00:00Z',
  },
  {
    id: 't2',
    goalId: 'g1',
    title: 'Review Pull Request',
    priority: 'medium',
    timeSlot: 'afternoon',
    estimatedMinutes: 30,
    date: '2026-10-29',
    completed: false,
    createdAt: '2026-10-29T08:00:00Z',
  },
  {
    id: 't3',
    goalId: 'g2',
    title: '5km Morning Run',
    priority: 'high',
    timeSlot: 'morning',
    estimatedMinutes: 45,
    date: '2026-10-29',
    completed: true,
    createdAt: '2026-10-29T06:30:00Z',
  },
  {
    id: 't4',
    title: 'Evening Reading',
    priority: 'low',
    timeSlot: 'evening',
    estimatedMinutes: 30,
    date: '2026-10-29',
    completed: false,
    createdAt: '2026-10-29T09:00:00Z',
  },
];

test('calculateDayProgress computes correct totals, percentages, and priority breakdowns', () => {
  const progress = calculateDayProgress(mockTasks);

  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 2);
  assert.equal(progress.remaining, 2);
  assert.equal(progress.percentage, 50); // 2 out of 4 is 50%
  assert.equal(progress.totalMinutes, 165);
  assert.equal(progress.completedMinutes, 105); // 60 + 45
  assert.equal(progress.highPriorityTotal, 2);
  assert.equal(progress.highPriorityCompleted, 2);
  assert.equal(progress.mediumPriorityTotal, 1);
  assert.equal(progress.mediumPriorityCompleted, 0);
  assert.equal(progress.lowPriorityTotal, 1);
  assert.equal(progress.lowPriorityCompleted, 0);
});

test('calculateDayProgress handles empty task list gracefully', () => {
  const progress = calculateDayProgress([]);
  assert.equal(progress.total, 0);
  assert.equal(progress.completed, 0);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.percentage, 0);
});

test('filterTasks properly filters by status, priority, category, and search query', () => {
  const defaultFilter: FilterState = {
    status: 'all',
    priority: 'all',
    category: 'all',
    searchQuery: '',
    groupBy: 'none',
  };

  // Filter pending only
  const pending = filterTasks(mockTasks, { ...defaultFilter, status: 'pending' }, mockGoalsMap);
  assert.equal(pending.length, 2);
  assert.deepEqual(pending.map((t) => t.id).sort(), ['t2', 't4']);

  // Filter completed only
  const completed = filterTasks(mockTasks, { ...defaultFilter, status: 'completed' }, mockGoalsMap);
  assert.equal(completed.length, 2);
  assert.deepEqual(completed.map((t) => t.id).sort(), ['t1', 't3']);

  // Filter high priority
  const highPriority = filterTasks(mockTasks, { ...defaultFilter, priority: 'high' }, mockGoalsMap);
  assert.equal(highPriority.length, 2);

  // Filter category
  const healthTasks = filterTasks(mockTasks, { ...defaultFilter, category: 'Health' }, mockGoalsMap);
  assert.equal(healthTasks.length, 1);
  assert.equal(healthTasks[0].id, 't3');

  // Search keyword in title or notes
  const searchSpec = filterTasks(mockTasks, { ...defaultFilter, searchQuery: 'openapi' }, mockGoalsMap);
  assert.equal(searchSpec.length, 1);
  assert.equal(searchSpec[0].id, 't1');
});

test('groupTasks groups by priority, timeSlot, and goal', () => {
  const byPriority = groupTasks(mockTasks, 'priority', mockGoalsMap);
  assert.equal(byPriority.length, 3);
  assert.equal(byPriority[0].groupName, 'High Priority');
  assert.equal(byPriority[0].tasks.length, 2);

  const byTimeSlot = groupTasks(mockTasks, 'timeSlot', mockGoalsMap);
  const morningGroup = byTimeSlot.find((g) => g.groupName === 'Morning Focus');
  assert.ok(morningGroup);
  assert.equal(morningGroup?.tasks.length, 2);

  const byGoal = groupTasks(mockTasks, 'goal', mockGoalsMap);
  const careerGroup = byGoal.find((g) => g.groupName === 'Career Sprint');
  assert.ok(careerGroup);
  assert.equal(careerGroup?.tasks.length, 2);
  const generalGroup = byGoal.find((g) => g.groupName === 'General Daily Tasks');
  assert.ok(generalGroup);
  assert.equal(generalGroup?.tasks.length, 1);
});

test('calculateWeeklyProgress generates 7 days with completion rates', () => {
  const weekly = calculateWeeklyProgress(mockTasks, '2026-10-29', '2026-10-29');
  assert.equal(weekly.length, 7);

  const thursday = weekly.find((d) => d.date === '2026-10-29');
  assert.ok(thursday);
  assert.equal(thursday?.totalTasks, 4);
  assert.equal(thursday?.completedTasks, 2);
  assert.equal(thursday?.percentage, 50);
  assert.equal(thursday?.isToday, true);
});

test('calculateMonthlyOverview computes month statistics and calendar days', () => {
  const monthly = calculateMonthlyOverview(mockTasks, '2026-10-29', '2026-10-29');
  assert.equal(monthly.monthName, 'October');
  assert.equal(monthly.year, 2026);
  assert.equal(monthly.days.length, 31); // October has 31 days
  assert.equal(monthly.totalPlannedTasks, 4);
  assert.equal(monthly.totalCompletedTasks, 2);
});

test('calculateStreakStats tracks productive day streaks accurately', () => {
  const multiDayTasks: Task[] = [
    // 2026-10-27: 2/2 (100%)
    { id: 'm1', title: 'Task 1', priority: 'high', timeSlot: 'morning', estimatedMinutes: 30, date: '2026-10-27', completed: true, createdAt: '' },
    { id: 'm2', title: 'Task 2', priority: 'low', timeSlot: 'evening', estimatedMinutes: 30, date: '2026-10-27', completed: true, createdAt: '' },
    // 2026-10-28: 2/3 (66%)
    { id: 'm3', title: 'Task 3', priority: 'medium', timeSlot: 'morning', estimatedMinutes: 30, date: '2026-10-28', completed: true, createdAt: '' },
    { id: 'm4', title: 'Task 4', priority: 'medium', timeSlot: 'afternoon', estimatedMinutes: 30, date: '2026-10-28', completed: true, createdAt: '' },
    { id: 'm5', title: 'Task 5', priority: 'low', timeSlot: 'evening', estimatedMinutes: 30, date: '2026-10-28', completed: false, createdAt: '' },
    // 2026-10-29: 2/2 (100%)
    { id: 'm6', title: 'Task 6', priority: 'high', timeSlot: 'morning', estimatedMinutes: 30, date: '2026-10-29', completed: true, createdAt: '' },
    { id: 'm7', title: 'Task 7', priority: 'high', timeSlot: 'afternoon', estimatedMinutes: 30, date: '2026-10-29', completed: true, createdAt: '' },
  ];

  const streaks = calculateStreakStats(multiDayTasks, '2026-10-29');
  assert.equal(streaks.currentStreak, 3);
  assert.equal(streaks.longestStreak, 3);
  assert.equal(streaks.totalProductiveDays, 3);
});

test('formatHeaderDate returns friendly relative dates', () => {
  assert.equal(formatHeaderDate('2026-10-29', '2026-10-29').startsWith('Today,'), true);
  assert.equal(formatHeaderDate('2026-10-28', '2026-10-29').startsWith('Yesterday,'), true);
  assert.equal(formatHeaderDate('2026-10-30', '2026-10-29').startsWith('Tomorrow,'), true);
});
