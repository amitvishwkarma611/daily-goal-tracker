import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { Task } from '../types';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onCompleteTask: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  onCompleteTask,
}) => {
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [durationSeconds, setDurationSeconds] = useState<number>(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (task) {
      const minutes = sessionType === 'focus' ? (task.estimatedMinutes || 25) : 5;
      const secs = minutes * 60;
      setDurationSeconds(secs);
      setSecondsRemaining(secs);
      setIsActive(false);
    }
  }, [task, sessionType, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  if (!isOpen || !task) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent =
    durationSeconds > 0
      ? Math.round(((durationSeconds - secondsRemaining) / durationSeconds) * 100)
      : 0;

  const handleTogglePlay = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(durationSeconds);
  };

  const handleFinish = () => {
    onCompleteTask(task.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-timer-title"
    >
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-600 hover:text-neutral-900 rounded transition-colors"
          aria-label="Close timer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Deep Focus Session</span>
        </div>

        <h3 id="focus-timer-title" className="text-base font-bold text-neutral-900 mb-1 px-4 truncate">
          {task.title}
        </h3>

        {/* Focus / Break toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-lg my-4 text-xs">
          <button
            onClick={() => setSessionType('focus')}
            className={`px-3 py-1 rounded-md transition-colors ${
              sessionType === 'focus' ? 'bg-white font-semibold text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            Focus ({task.estimatedMinutes || 25}m)
          </button>
          <button
            onClick={() => setSessionType('break')}
            className={`px-3 py-1 rounded-md transition-colors ${
              sessionType === 'break' ? 'bg-white font-semibold text-neutral-900 shadow-2xs' : 'text-neutral-600'
            }`}
          >
            Break (5m)
          </button>
        </div>

        {/* Large Countdown Clock */}
        <div className="my-6">
          <div className="text-5xl font-extrabold font-mono tabular-nums tracking-tight text-neutral-900">
            {timeFormatted}
          </div>
          {/* Progress track */}
          <div className="w-3/4 mx-auto h-2 bg-neutral-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-2.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors shadow-xs flex items-center gap-2"
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{secondsRemaining === durationSeconds ? 'Start Focus' : 'Resume'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            className="p-2.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors"
            title="Complete task now"
            aria-label="Complete task now"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
