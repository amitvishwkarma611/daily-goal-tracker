import React, { useState } from 'react';
import {
  Check,
  Clock,
  Edit2,
  Trash2,
  Play,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { Task, Goal } from '../types';

interface TaskItemProps {
  task: Task;
  goal?: Goal;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  goal,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
}) => {
  const [showNotes, setShowNotes] = useState(false);

  // Priority indicator styles
  const priorityConfig = {
    high: {
      label: 'High Priority',
      badgeColor: 'text-red-700 bg-red-50 border-red-200',
      dotColor: 'bg-red-500',
    },
    medium: {
      label: 'Medium Priority',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      dotColor: 'bg-amber-500',
    },
    low: {
      label: 'Low Priority',
      badgeColor: 'text-slate-700 bg-slate-50 border-slate-200',
      dotColor: 'bg-slate-400',
    },
  }[task.priority];

  const timeSlotLabel = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    anytime: 'Flexible',
  }[task.timeSlot];

  return (
    <div
      className={`group relative bg-white border rounded-lg transition-all ${
        task.completed
          ? 'border-neutral-200 bg-neutral-50/60 opacity-90'
          : 'border-neutral-200 hover:border-neutral-300 shadow-2xs'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3.5">
        {/* Native accessible Checkbox button */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Mark task '${task.title}' as ${task.completed ? 'pending' : 'completed'}`}
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors border ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-neutral-300 bg-white hover:border-neutral-500'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Unboxed clean metadata with subtle dot separators */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
              <span className={`inline-block w-2 h-2 rounded-full ${priorityConfig.dotColor}`} />
              <span className="font-semibold text-neutral-700">{priorityConfig.label}</span>
              <span aria-hidden="true">·</span>
              <span>{timeSlotLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{task.estimatedMinutes}m</span>
              {goal && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-700 truncate max-w-[140px] sm:max-w-[200px]">
                    {goal.title}
                  </span>
                </>
              )}
            </div>
          </div>

          <h3
            className={`text-sm font-medium leading-snug transition-colors ${
              task.completed
                ? 'line-through text-neutral-600'
                : 'text-neutral-900 font-semibold'
            }`}
          >
            {task.title}
          </h3>

          {/* Notes display */}
          {task.notes && (
            <div className="mt-1.5">
              {showNotes ? (
                <p className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-100 whitespace-pre-wrap">
                  {task.notes}
                </p>
              ) : (
                <button
                  onClick={() => setShowNotes(true)}
                  className="text-xs text-neutral-600 hover:text-neutral-700 flex items-center gap-1"
                >
                  <ChevronDown className="w-3 h-3" />
                  <span>Show notes</span>
                </button>
              )}

              {showNotes && (
                <button
                  onClick={() => setShowNotes(false)}
                  className="mt-1 text-xs text-neutral-600 hover:text-neutral-700 flex items-center gap-1"
                >
                  <ChevronUp className="w-3 h-3" />
                  <span>Hide notes</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Actions (Pomodoro, Edit, Delete) */}
        <div className="flex items-center gap-1 shrink-0">
          {!task.completed && (
            <button
              onClick={() => onStartFocus(task)}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
              title="Start Pomodoro Focus"
              aria-label={`Start Pomodoro Focus on ${task.title}`}
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            title="Edit task"
            aria-label={`Edit task '${task.title}'`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete task"
            aria-label={`Delete task '${task.title}'`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
