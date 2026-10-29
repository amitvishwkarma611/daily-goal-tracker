import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import { Goal, Task, GoalCategory } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  tasks: Task[];
  onOpenNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddTaskForGoal: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  tasks,
  onOpenNewGoal,
  onEditGoal,
  onDeleteGoal,
  onAddTaskForGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: GoalCategory[] = ['Career', 'Health', 'Learning', 'Personal', 'Focus'];

  const filteredGoals =
    selectedCategory === 'all'
      ? goals
      : goals.filter((g) => g.category === selectedCategory);

  // Compute stats per goal
  const getGoalStats = (goalId: string) => {
    const goalTasks = tasks.filter((t) => t.goalId === goalId);
    const total = goalTasks.length;
    const completed = goalTasks.filter((t) => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  return (
    <div className="space-y-6">
      {/* Header and action */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Strategic Goals
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Define your core focus areas and connect daily tasks to meaningful outcomes.
            </p>
          </div>

          <button
            onClick={onOpenNewGoal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Category Filter tabs */}
        <div className="flex flex-wrap items-center gap-1 mt-4 pt-4 border-t border-neutral-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            All Categories ({goals.length})
          </button>
          {categories.map((c) => {
            const count = goals.filter((g) => g.category === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedCategory === c
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-2xs">
          <Target className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">No goals in this category</h3>
          <p className="text-xs text-neutral-600 mb-4">
            Create a goal to start breaking down actionable daily tasks.
          </p>
          <button
            onClick={onOpenNewGoal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const { total, completed, percentage } = getGoalStats(goal.id);

            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between hover:border-neutral-300 transition-colors"
              >
                <div>
                  {/* Top metadata strip with zero-pill formatting */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: goal.color || '#2563eb' }}
                      />
                      <span className="font-semibold text-neutral-800">{goal.category}</span>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-600" />
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        title="Edit goal"
                        aria-label={`Edit goal '${goal.title}'`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete goal"
                        aria-label={`Delete goal '${goal.title}'`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress bar and task action */}
                <div className="mt-5 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono tabular-nums">
                    <span className="text-neutral-600">
                      {completed} of {total} tasks completed
                    </span>
                    <span className="font-bold text-neutral-900">{percentage}%</span>
                  </div>

                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: goal.color || '#2563eb',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onAddTaskForGoal(goal.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Daily Task for Goal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
