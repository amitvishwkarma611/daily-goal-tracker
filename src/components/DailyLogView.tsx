import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, CheckCircle2, BookOpen, Save } from 'lucide-react';
import { DailyProductivityRecord } from '../types';
import { formatHeaderDate } from '../utils/goalTrackerLogic';

interface DailyLogViewProps {
  selectedDate: string;
  todayDate: string;
  records: DailyProductivityRecord[];
  onSaveRecord: (record: DailyProductivityRecord) => void;
  onSelectDate: (date: string) => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  selectedDate,
  todayDate,
  records,
  onSaveRecord,
  onSelectDate,
}) => {
  const existingRecord = records.find((r) => r.date === selectedDate);

  const [focusRating, setFocusRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [wins, setWins] = useState<string[]>([]);
  const [newWinInput, setNewWinInput] = useState<string>('');
  const [obstacles, setObstacles] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    if (existingRecord) {
      setFocusRating(existingRecord.focusRating || 5);
      setNotes(existingRecord.notes || '');
      setWins(existingRecord.wins || []);
      setObstacles(existingRecord.obstacles || '');
    } else {
      setFocusRating(5);
      setNotes('');
      setWins([]);
      setObstacles('');
    }
  }, [selectedDate, existingRecord]);

  const handleAddWin = () => {
    if (!newWinInput.trim()) return;
    setWins([...wins, newWinInput.trim()]);
    setNewWinInput('');
  };

  const handleRemoveWin = (idx: number) => {
    setWins(wins.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const updated: DailyProductivityRecord = {
      date: selectedDate,
      focusRating,
      notes: notes.trim(),
      wins,
      obstacles: obstacles.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    onSaveRecord(updated);
    setSaveStatus('Record saved successfully');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Past 7 records list
  const pastRecords = [...records]
    .filter((r) => r.date !== selectedDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Active Daily Journal Form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Daily Productivity Record
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Reflect on focus, celebrate daily wins, and note obstacles for {formatHeaderDate(selectedDate, todayDate)}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-medium">{saveStatus}</span>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-2xs shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>
        </div>

        {/* 1. Focus Rating */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Today's Focus & Productivity Rating (1–5)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setFocusRating(val)}
                className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-medium ${
                  focusRating >= val
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    focusRating >= val
                      ? 'text-amber-500 fill-amber-400'
                      : 'text-neutral-600'
                  }`}
                />
                <span className="font-mono tabular-nums">{val}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Key Wins List */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Key Wins & Milestones Achieved
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Finished refactoring auth layer without bugs..."
              value={newWinInput}
              onChange={(e) => setNewWinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWin();
                }
              }}
              className="flex-1 text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddWin}
              className="px-3 py-2 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Win</span>
            </button>
          </div>

          {wins.length > 0 ? (
            <div className="space-y-1.5">
              {wins.map((win, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs text-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{win}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveWin(idx)}
                    className="text-neutral-600 hover:text-red-600 p-1 rounded"
                    title="Remove win"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 italic">No wins recorded yet for this day.</p>
          )}
        </div>

        {/* 3. Reflection Notes */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Daily Reflection & Notes
          </label>
          <textarea
            rows={3}
            placeholder="What went well today? What will you improve tomorrow?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
          />
        </div>

        {/* 4. Obstacles / Blockers */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Obstacles & Distractions (Optional)
          </label>
          <input
            type="text"
            placeholder="Any unexpected delays, interruptions, or fatigue triggers..."
            value={obstacles}
            onChange={(e) => setObstacles(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-neutral-900"
          />
        </div>
      </div>

      {/* Past Productivity Records Archive */}
      {pastRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            Recent Productivity Logs
          </h3>
          <div className="space-y-3">
            {pastRecords.map((r) => (
              <div
                key={r.date}
                className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/70 hover:bg-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 mb-1">
                    <span className="font-semibold text-neutral-800">{r.date}</span>
                    <span aria-hidden="true">·</span>
                    <div className="flex items-center gap-0.5 text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-mono tabular-nums">{r.focusRating}/5 rating</span>
                    </div>
                  </div>
                  {r.notes && (
                    <p className="text-xs text-neutral-700 line-clamp-1">{r.notes}</p>
                  )}
                  {r.wins && r.wins.length > 0 && (
                    <p className="text-[11px] text-neutral-600 mt-1">
                      {r.wins.length} {r.wins.length === 1 ? 'win' : 'wins'} logged: {r.wins[0]}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onSelectDate(r.date)}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-100 transition-colors shrink-0"
                >
                  View Day
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
