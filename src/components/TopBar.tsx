import React from 'react';
import { Plus, Target, CheckCircle2, BarChart3, BookOpen, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { User } from '../firebase';

export type ActiveTab = 'tracker' | 'goals' | 'analytics' | 'log';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  currentUser: User | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTask,
  currentUser,
  onSignOut,
  onOpenAuth,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0">
              Daily Goal Tracker
            </span>
          </div>

          {/* Zone 2: Clean 4 single-line text navigation links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => onTabChange('tracker')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'tracker'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 -mb-[2px]'
                  : 'hover:text-neutral-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Today's Tracker</span>
            </button>
            <button
              onClick={() => onTabChange('goals')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'goals'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 -mb-[2px]'
                  : 'hover:text-neutral-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Goals Overview</span>
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 -mb-[2px]'
                  : 'hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progress & Analytics</span>
            </button>
            <button
              onClick={() => onTabChange('log')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'log'
                  ? 'text-neutral-950 font-semibold border-b-2 border-neutral-900 -mb-[2px]'
                  : 'hover:text-neutral-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Productivity Log</span>
            </button>
          </nav>

          {/* Zone 3: Auth Account & 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0"
                  title={currentUser.email || currentUser.displayName || 'User'}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={onSignOut}
                  className="hidden md:inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                  title="Sign out of account"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-neutral-950 px-2.5 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-medium whitespace-nowrap shrink-0"
                aria-label="Sign in or register"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs whitespace-nowrap shrink-0"
              aria-label="Add new daily task"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="sm:hidden flex items-center justify-around border-t border-neutral-100 py-2 text-xs font-medium text-neutral-600">
          <button
            onClick={() => onTabChange('tracker')}
            className={`py-1 px-2 whitespace-nowrap ${
              activeTab === 'tracker' ? 'text-neutral-950 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            Tracker
          </button>
          <button
            onClick={() => onTabChange('goals')}
            className={`py-1 px-2 whitespace-nowrap ${
              activeTab === 'goals' ? 'text-neutral-950 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`py-1 px-2 whitespace-nowrap ${
              activeTab === 'analytics' ? 'text-neutral-950 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => onTabChange('log')}
            className={`py-1 px-2 whitespace-nowrap ${
              activeTab === 'log' ? 'text-neutral-950 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            Log
          </button>
          {currentUser && (
            <button
              onClick={onSignOut}
              className="py-1 px-2 text-red-600 hover:text-red-700 whitespace-nowrap"
              title="Sign Out"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
