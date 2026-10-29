import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Task, Goal, FilterState, GoalCategory } from '../types';
import { TaskItem } from './TaskItem';
import { filterTasks, groupTasks } from '../utils/goalTrackerLogic';

interface TaskListProps {
  tasks: Task[];
  goals: Goal[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenNewTask: () => void;
  onStartFocus: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  goals,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onOpenNewTask,
  onStartFocus,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    category: 'all',
    searchQuery: '',
    groupBy: 'none',
  });

  const goalsMap = new Map<string, Goal>(goals.map((g) => [g.id, g]));

  const filteredTasks = filterTasks(tasks, filter, goalsMap);
  const grouped = groupTasks(filteredTasks, filter.groupBy, goalsMap);

  const categories: GoalCategory[] = ['Career', 'Health', 'Learning', 'Personal', 'Focus'];

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      {/* Control Strip: Search & Interactive Filter Segmented Controls */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0">
            <button
              onClick={() => setFilter({ ...filter, status: 'all' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter.status === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter({ ...filter, status: 'pending' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter.status === 'pending'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Remaining ({pendingCount})
            </button>
            <button
              onClick={() => setFilter({ ...filter, status: 'completed' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter.status === 'completed'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks or notes..."
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-600 focus:bg-white focus:outline-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Secondary filters: Priority, Category, Grouping */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-600 font-medium">Priority:</span>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value as any })}
                className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-800 text-xs focus:outline-neutral-900"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-600 font-medium">Category:</span>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-800 text-xs focus:outline-neutral-900"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grouping dropdown */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-neutral-600 font-medium">Group by:</span>
            <select
              value={filter.groupBy}
              onChange={(e) => setFilter({ ...filter, groupBy: e.target.value as any })}
              className="bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-800 text-xs focus:outline-neutral-900"
            >
              <option value="none">None</option>
              <option value="priority">Priority</option>
              <option value="timeSlot">Time of Day</option>
              <option value="goal">Associated Goal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 mb-3">
            <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 mb-1">
            {tasks.length === 0 ? 'No tasks planned for this day' : 'No matching tasks found'}
          </h3>
          <p className="text-xs text-neutral-600 max-w-sm mx-auto mb-4">
            {tasks.length === 0
              ? 'Add daily tasks linked to your goals to build consistent momentum and track your progress.'
              : 'Try clearing your search query or adjusting your priority and category filters.'}
          </p>
          {tasks.length === 0 ? (
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Task</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setFilter({
                  status: 'all',
                  priority: 'all',
                  category: 'all',
                  searchQuery: '',
                  groupBy: 'none',
                })
              }
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.groupName} className="space-y-2">
              {filter.groupBy !== 'none' && (
                <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    {group.groupName}
                  </h4>
                  <span className="text-xs font-mono tabular-nums text-neutral-600">
                    {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    goal={task.goalId ? goalsMap.get(task.goalId) : undefined}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartFocus={onStartFocus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
