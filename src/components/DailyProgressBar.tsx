import React from 'react';
import { CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react';
import { DayProgress } from '../types';

interface DailyProgressBarProps {
  progress: DayProgress;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({ progress }) => {
  const {
    total,
    completed,
    remaining,
    percentage,
    totalMinutes,
    completedMinutes,
    highPriorityTotal,
    highPriorityCompleted,
  } = progress;

  // Visual status message
  let motivationalMessage = 'Set your daily goals to get started';
  if (total > 0) {
    if (percentage === 100) {
      motivationalMessage = 'All goals achieved for today! Incredible consistency.';
    } else if (percentage >= 75) {
      motivationalMessage = 'Almost there! Finish the final tasks to reach 100%.';
    } else if (percentage >= 50) {
      motivationalMessage = 'Over halfway through! Maintain momentum into the afternoon.';
    } else if (percentage > 0) {
      motivationalMessage = 'Good start. Focus on high priority items first.';
    } else {
      motivationalMessage = `${total} tasks planned for today. Ready to crush it?`;
    }
  }

  // Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Gauge + Main stats */}
        <div className="flex items-center gap-5">
          {/* Circular SVG Gauge */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-neutral-100"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-emerald-600 transition-all duration-500 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono tabular-nums text-neutral-900 leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] text-neutral-600 font-medium mt-0.5">
                done
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 mb-1">
              <span className="whitespace-nowrap">Daily Completion</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-medium text-neutral-700 whitespace-nowrap">
                {completed} of {total} tasks
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              {completed === total && total > 0 ? 'Day Complete' : `${remaining} Tasks Remaining`}
            </h2>
            <p className="text-xs text-neutral-600 mt-1 max-w-md">
              {motivationalMessage}
            </p>
          </div>
        </div>

        {/* Right: Breakdown metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:border-l md:border-neutral-200 md:pl-6">
          {/* Completed vs Total */}
          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Finished</span>
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {completed} <span className="text-xs font-normal text-neutral-600">/ {total}</span>
            </div>
          </div>

          {/* High Priority Focus */}
          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>High Priority</span>
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {highPriorityCompleted}{' '}
              <span className="text-xs font-normal text-neutral-600">/ {highPriorityTotal}</span>
            </div>
          </div>

          {/* Time Investment */}
          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Time Invested</span>
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
              {completedMinutes}{' '}
              <span className="text-xs font-normal text-neutral-600">/ {totalMinutes}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="mt-5">
        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              percentage === 100
                ? 'bg-emerald-600'
                : percentage >= 50
                ? 'bg-blue-600'
                : 'bg-amber-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
