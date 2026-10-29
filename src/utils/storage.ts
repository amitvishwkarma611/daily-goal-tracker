import { Goal, Task, DailyProductivityRecord } from '../types';
import {
  INITIAL_GOALS,
  generateInitialTasks,
  generateInitialProductivityRecords,
} from './seedData';

const STORAGE_KEYS = {
  GOALS: 'dgt_goals_v1',
  TASKS: 'dgt_tasks_v1',
  RECORDS: 'dgt_records_v1',
  INITIALIZED: 'dgt_initialized_v1',
};

export function loadStoredGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored goals', e);
  }
  return INITIAL_GOALS;
}

export function saveStoredGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
}

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored tasks', e);
  }
  return generateInitialTasks();
}

export function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadStoredRecords(): DailyProductivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored records', e);
  }
  return generateInitialProductivityRecords();
}

export function saveStoredRecords(records: DailyProductivityRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function resetToDemoData(): {
  goals: Goal[];
  tasks: Task[];
  records: DailyProductivityRecord[];
} {
  const goals = INITIAL_GOALS;
  const tasks = generateInitialTasks();
  const records = generateInitialProductivityRecords();

  saveStoredGoals(goals);
  saveStoredTasks(tasks);
  saveStoredRecords(records);

  return { goals, tasks, records };
}
