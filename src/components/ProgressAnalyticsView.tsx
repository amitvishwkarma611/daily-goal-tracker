import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Task, Goal } from '../types';
import {
  calculateDayProgress,
  calculateWeeklyProgress,
  calculateMonthlyOverview,
  calculateStreakStats,
  formatHeaderDate,
} from '../utils/goalTrackerLogic';

interface ProgressAnalyticsViewProps {
  tasks: Task[];
  goals: Goal[];
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  tasks,
  goals,
  selectedDate,
  todayDate,
  onSelectDate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const dayProgress = calculateDayProgress(tasks.filter((t) => t.date === selectedDate));
  const weeklyStats = calculateWeeklyProgress(tasks, selectedDate, todayDate);
  const monthlyStats = calculateMonthlyOverview(tasks, selectedDate, todayDate);
  const streakStats = calculateStreakStats(tasks, todayDate);

  // Month navigation for monthly view
  const handlePrevMonth = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setMonth(d.getMonth() - 1);
    onSelectDate(d.toISOString().slice(0, 10));
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setMonth(d.getMonth() + 1);
    onSelectDate(d.toISOString().slice(0, 10));
  };

  // Best day of current week
  const bestDay = [...weeklyStats].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Progress & Analytics
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Review daily execution, weekly trends, and monthly consistency.
            </p>
          </div>

          {/* Sub-tab segmented toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveSubTab('daily')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'daily'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveSubTab('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'weekly'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveSubTab('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === 'monthly'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Global Streak KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-600 font-medium">Current Streak</div>
              <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                {streakStats.currentStreak} <span className="text-xs font-normal text-neutral-600">days</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-600 font-medium">Longest Streak</div>
              <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                {streakStats.longestStreak} <span className="text-xs font-normal text-neutral-600">days</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="w-9 h-9 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-neutral-600 font-medium">Productive Days</div>
              <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                {streakStats.totalProductiveDays} <span className="text-xs font-normal text-neutral-600">logged</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. DAILY VIEW */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900">
                Daily Breakdown for {formatHeaderDate(selectedDate, todayDate)}
              </h3>
              <span className="text-xs font-mono tabular-nums text-neutral-600 font-semibold">
                {dayProgress.percentage}% Overall
              </span>
            </div>

            {/* Priority Distribution */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-700">High Priority Targets</span>
                  <span className="font-mono tabular-nums text-neutral-600">
                    {dayProgress.highPriorityCompleted} of {dayProgress.highPriorityTotal} done
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        dayProgress.highPriorityTotal > 0
                          ? Math.round(
                              (dayProgress.highPriorityCompleted / dayProgress.highPriorityTotal) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-700">Medium Priority Tasks</span>
                  <span className="font-mono tabular-nums text-neutral-600">
                    {dayProgress.mediumPriorityCompleted} of {dayProgress.mediumPriorityTotal} done
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        dayProgress.mediumPriorityTotal > 0
                          ? Math.round(
                              (dayProgress.mediumPriorityCompleted /
                                dayProgress.mediumPriorityTotal) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-neutral-700">Low Priority / Routine</span>
                  <span className="font-mono tabular-nums text-neutral-600">
                    {dayProgress.lowPriorityCompleted} of {dayProgress.lowPriorityTotal} done
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        dayProgress.lowPriorityTotal > 0
                          ? Math.round(
                              (dayProgress.lowPriorityCompleted / dayProgress.lowPriorityTotal) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-neutral-100 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="text-neutral-600 mb-1">Planned Focus Time</div>
                <div className="text-base font-bold font-mono tabular-nums text-neutral-900">
                  {dayProgress.totalMinutes} minutes
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="text-neutral-600 mb-1">Completed Focus Time</div>
                <div className="text-base font-bold font-mono tabular-nums text-emerald-700">
                  {dayProgress.completedMinutes} minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WEEKLY VIEW */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  7-Day Execution Trend (Mon – Sun)
                </h3>
                <p className="text-xs text-neutral-600">
                  Click any day column to view and edit that day's tasks.
                </p>
              </div>

              {bestDay && bestDay.totalTasks > 0 && (
                <div className="text-xs text-neutral-600">
                  Best Day:{' '}
                  <span className="font-semibold text-neutral-900">
                    {bestDay.dayLabel} ({bestDay.percentage}%)
                  </span>
                </div>
              )}
            </div>

            {/* 7-Day Bar Chart */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 h-52 items-end pt-4 pb-2 border-b border-neutral-100">
              {weeklyStats.map((stat) => {
                const isSelected = stat.date === selectedDate;
                const isToday = stat.isToday;

                return (
                  <button
                    key={stat.date}
                    onClick={() => onSelectDate(stat.date)}
                    className={`flex flex-col items-center h-full justify-end group transition-all p-1 rounded-lg ${
                      isSelected
                        ? 'bg-neutral-100 ring-1 ring-neutral-300'
                        : 'hover:bg-neutral-50'
                    }`}
                    title={`${stat.dayLabel} ${stat.date}: ${stat.completedTasks}/${stat.totalTasks} completed (${stat.percentage}%)`}
                  >
                    {/* Percentage text above bar */}
                    <span className="text-[10px] sm:text-xs font-mono tabular-nums font-semibold text-neutral-600 mb-1.5">
                      {stat.percentage}%
                    </span>

                    {/* Bar container */}
                    <div className="w-full sm:w-10 bg-neutral-100 rounded-t-md h-32 flex flex-col justify-end p-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          stat.percentage === 100
                            ? 'bg-emerald-600'
                            : stat.percentage >= 60
                            ? 'bg-blue-600'
                            : stat.percentage > 0
                            ? 'bg-amber-600'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(stat.percentage, 4)}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <div className="mt-2 text-center">
                      <span
                        className={`block text-[11px] sm:text-xs font-semibold ${
                          isSelected || isToday ? 'text-neutral-900' : 'text-neutral-600'
                        }`}
                      >
                        {stat.dayLabel}
                      </span>
                      <span className="block text-[10px] text-neutral-600 font-mono tabular-nums">
                        {stat.completedTasks}/{stat.totalTasks}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MONTHLY VIEW */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
            {/* Month Navigator Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {monthlyStats.monthName} {monthlyStats.year}
                </h3>
                <p className="text-xs text-neutral-600">
                  Monthly Goal Consistency & Habit Heatmap
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                  title="Previous Month"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="text-[11px] text-neutral-600">Avg Completion</div>
                <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                  {monthlyStats.avgCompletionRate}%
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="text-[11px] text-neutral-600">Tasks Completed</div>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {monthlyStats.totalCompletedTasks}
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="text-[11px] text-neutral-600">Planned Tasks</div>
                <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                  {monthlyStats.totalPlannedTasks}
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <div className="text-[11px] text-neutral-600">100% Perfect Days</div>
                <div className="text-lg font-bold font-mono tabular-nums text-blue-700">
                  {monthlyStats.perfectDaysCount}
                </div>
              </div>
            </div>

            {/* Calendar Grid Header (Sun - Sat) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-neutral-600 mb-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Heatmap Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Padding offset for first day of month */}
              {Array.from({ length: monthlyStats.days[0]?.dayOfWeek || 0 }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 rounded-md bg-neutral-50/40" />
              ))}

              {monthlyStats.days.map((day) => {
                const isSelected = day.date === selectedDate;
                const isToday = day.isToday;

                // Heatmap color logic
                let heatColor = 'bg-neutral-50 border-neutral-100 text-neutral-600';
                if (day.totalTasks > 0) {
                  if (day.percentage === 100) {
                    heatColor = 'bg-emerald-100 border-emerald-300 text-emerald-950 font-semibold';
                  } else if (day.percentage >= 60) {
                    heatColor = 'bg-emerald-50 border-emerald-200 text-emerald-900';
                  } else if (day.percentage > 0) {
                    heatColor = 'bg-amber-50 border-amber-200 text-amber-900';
                  } else {
                    heatColor = 'bg-slate-50 border-slate-200 text-slate-700';
                  }
                }

                return (
                  <button
                    key={day.date}
                    onClick={() => onSelectDate(day.date)}
                    className={`h-16 p-1.5 border rounded-lg flex flex-col justify-between text-left transition-all ${heatColor} ${
                      isSelected ? 'ring-2 ring-neutral-900' : 'hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-bold">{day.dayNumber}</span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Today" />
                      )}
                    </div>

                    {day.totalTasks > 0 ? (
                      <div className="text-[10px] font-mono tabular-nums leading-tight">
                        <div>{day.percentage}%</div>
                        <div className="text-[9px] opacity-75">
                          {day.completedTasks}/{day.totalTasks}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[9px] opacity-40">—</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end gap-3 mt-4 text-[11px] text-neutral-600">
              <span className="font-medium">Completion Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-neutral-100 border border-neutral-200" />
                <span>0%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                <span>1–59%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                <span>60–99%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
