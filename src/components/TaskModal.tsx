import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Task, Goal, TaskPriority, TaskTimeSlot } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => void;
  initialTask?: Task | null;
  goals: Goal[];
  defaultDate: string;
  defaultGoalId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  goals,
  defaultDate,
  defaultGoalId,
}) => {
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [timeSlot, setTimeSlot] = useState<TaskTimeSlot>('morning');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [date, setDate] = useState<string>(defaultDate);
  const [notes, setNotes] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setGoalId(initialTask.goalId || '');
      setPriority(initialTask.priority);
      setTimeSlot(initialTask.timeSlot);
      setEstimatedMinutes(initialTask.estimatedMinutes);
      setDate(initialTask.date);
      setNotes(initialTask.notes || '');
      setCompleted(initialTask.completed);
    } else {
      setTitle('');
      setGoalId(defaultGoalId || '');
      setPriority('medium');
      setTimeSlot('morning');
      setEstimatedMinutes(30);
      setDate(defaultDate);
      setNotes('');
      setCompleted(false);
    }
    setError('');
  }, [initialTask, defaultDate, defaultGoalId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      goalId: goalId || undefined,
      priority,
      timeSlot,
      estimatedMinutes: Number(estimatedMinutes) || 15,
      date,
      completed,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="bg-white rounded-xl border border-neutral-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-600 hover:text-neutral-900 rounded transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 id="task-modal-title" className="text-base font-bold text-neutral-900 mb-4">
          {initialTask ? 'Edit Daily Task' : 'Add New Daily Task'}
        </h3>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Complete sprint deliverables"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
            />
          </div>

          {/* Goal Link */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Associated Strategic Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
            >
              <option value="">None (Standalone Daily Task)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Time Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Time of Day
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TaskTimeSlot)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Flexible</option>
              </select>
            </div>
          </div>

          {/* Duration & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Action Notes or Checklist (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key specifications, links, or sub-steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-2xs"
            >
              {initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
