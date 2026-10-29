import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame } from 'lucide-react';
import { formatHeaderDate } from '../utils/goalTrackerLogic';

interface DateNavigationProps {
  selectedDate: string;
  todayDate: string;
  currentStreak: number;
  onDateChange: (newDate: string) => void;
  onJumpToToday: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  todayDate,
  currentStreak,
  onDateChange,
  onJumpToToday,
}) => {
  const isToday = selectedDate === todayDate;

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-neutral-200">
      {/* Date Stepper */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white shadow-2xs">
          <button
            onClick={handlePrevDay}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-l-lg transition-colors"
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 flex items-center gap-2 border-x border-neutral-200">
            <CalendarIcon className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-semibold text-neutral-900">
              {formatHeaderDate(selectedDate, todayDate)}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-r-lg transition-colors"
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isToday && (
          <button
            onClick={onJumpToToday}
            className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Jump to Today
          </button>
        )}

        {/* Quick Date Picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) onDateChange(e.target.value);
          }}
          className="text-xs text-neutral-600 bg-transparent border border-neutral-200 rounded-md px-2 py-1.5 hover:border-neutral-300 focus:outline-neutral-900"
          aria-label="Select specific date"
        />
      </div>

      {/* Streak badge & Quick status info */}
      <div className="flex items-center gap-3 text-xs text-neutral-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md font-medium">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span className="font-mono tabular-nums font-bold">{currentStreak}</span>
          <span>Day Streak</span>
        </div>
      </div>
    </div>
  );
};
