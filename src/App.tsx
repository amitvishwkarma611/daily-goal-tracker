import React, { useState, useEffect } from 'react';
import {
  Goal,
  Task,
  DailyProductivityRecord,
} from './types';
import {
  loadStoredGoals,
  saveStoredGoals,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredRecords,
  saveStoredRecords,
  resetToDemoData,
} from './utils/storage';
import {
  getTodayDateString,
  INITIAL_GOALS,
  generateInitialTasks,
  generateInitialProductivityRecords,
} from './utils/seedData';
import {
  calculateDayProgress,
  calculateStreakStats,
} from './utils/goalTrackerLogic';
import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  User,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { TopBar, ActiveTab } from './components/TopBar';
import { DateNavigation } from './components/DateNavigation';
import { DailyProgressBar } from './components/DailyProgressBar';
import { TaskList } from './components/TaskList';
import { GoalsView } from './components/GoalsView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';
import { DailyLogView } from './components/DailyLogView';
import { AuthView } from './components/AuthView';
import { TaskModal } from './components/TaskModal';
import { GoalModal } from './components/GoalModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { RotateCcw, Download, Upload, LogIn } from 'lucide-react';

export default function App() {
  const todayDate = getTodayDateString();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  // App navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  // Application data
  const [goals, setGoals] = useState<Goal[]>(() => loadStoredGoals());
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [records, setRecords] = useState<DailyProductivityRecord[]>(() => loadStoredRecords());

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultGoalIdForNewTask, setDefaultGoalIdForNewTask] = useState<string | undefined>();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [focusTimerTask, setFocusTimerTask] = useState<Task | null>(null);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthChecked(true);

      if (user) {
        setShowAuthScreen(false);
        // Load user data from Firestore
        await loadUserFirestoreData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to load user-scoped Firestore data
  const loadUserFirestoreData = async (uid: string) => {
    try {
      const goalsCol = collection(db, 'users', uid, 'goals');
      const tasksCol = collection(db, 'users', uid, 'tasks');
      const recordsCol = collection(db, 'users', uid, 'records');

      const [goalsSnap, tasksSnap, recordsSnap] = await Promise.all([
        getDocs(goalsCol),
        getDocs(tasksCol),
        getDocs(recordsCol),
      ]);

      if (goalsSnap.empty && tasksSnap.empty) {
        // Initialize new user with starter goals and tasks
        const initialG = INITIAL_GOALS;
        const initialT = generateInitialTasks();
        const initialR = generateInitialProductivityRecords();

        setGoals(initialG);
        setTasks(initialT);
        setRecords(initialR);

        // Seed Firestore
        for (const g of initialG) {
          await setDoc(doc(goalsCol, g.id), { ...g, userId: uid });
        }
        for (const t of initialT) {
          await setDoc(doc(tasksCol, t.id), { ...t, userId: uid });
        }
        for (const r of initialR) {
          await setDoc(doc(recordsCol, r.date), { ...r, userId: uid });
        }
      } else {
        const loadedGoals: Goal[] = [];
        goalsSnap.forEach((d) => loadedGoals.push(d.data() as Goal));

        const loadedTasks: Task[] = [];
        tasksSnap.forEach((d) => loadedTasks.push(d.data() as Task));

        const loadedRecords: DailyProductivityRecord[] = [];
        recordsSnap.forEach((d) => loadedRecords.push(d.data() as DailyProductivityRecord));

        if (loadedGoals.length > 0) setGoals(loadedGoals);
        if (loadedTasks.length > 0) setTasks(loadedTasks);
        if (loadedRecords.length > 0) setRecords(loadedRecords);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    saveStoredGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  // Derived calculations
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const dayProgress = calculateDayProgress(dayTasks);
  const streakStats = calculateStreakStats(tasks, todayDate);

  // Task Handlers
  const handleToggleComplete = async (taskId: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    setTasks(updatedTasks);

    // Sync to Firestore if authenticated
    if (currentUser) {
      const taskObj = updatedTasks.find((t) => t.id === taskId);
      if (taskObj) {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid, 'tasks', taskId),
            { ...taskObj, userId: currentUser.uid }
          );
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/tasks/${taskId}`);
        }
      }
    }
  };

  const handleSaveTask = async (
    taskData: Omit<Task, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (taskData.id) {
      const updatedTasks = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              ...taskData,
              completedAt:
                taskData.completed && !t.completed
                  ? new Date().toISOString()
                  : t.completedAt,
            }
          : t
      );
      setTasks(updatedTasks);

      if (currentUser) {
        const item = updatedTasks.find((t) => t.id === taskData.id);
        if (item) {
          try {
            await setDoc(
              doc(db, 'users', currentUser.uid, 'tasks', taskData.id),
              { ...item, userId: currentUser.uid }
            );
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/tasks/${taskData.id}`);
          }
        }
      }
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);

      if (currentUser) {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid, 'tasks', newTask.id),
            { ...newTask, userId: currentUser.uid }
          );
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}/tasks/${newTask.id}`);
        }
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/tasks/${taskId}`);
      }
    }
  };

  const handleOpenNewTask = (goalId?: string) => {
    setEditingTask(null);
    setDefaultGoalIdForNewTask(goalId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultGoalIdForNewTask(undefined);
    setIsTaskModalOpen(true);
  };

  // Goal Handlers
  const handleSaveGoal = async (
    goalData: Omit<Goal, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (goalData.id) {
      const updatedGoals = goals.map((g) =>
        g.id === goalData.id ? { ...g, ...goalData } : g
      );
      setGoals(updatedGoals);

      if (currentUser) {
        const item = updatedGoals.find((g) => g.id === goalData.id);
        if (item) {
          try {
            await setDoc(
              doc(db, 'users', currentUser.uid, 'goals', goalData.id),
              { ...item, userId: currentUser.uid }
            );
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}/goals/${goalData.id}`);
          }
        }
      }
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);

      if (currentUser) {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid, 'goals', newGoal.id),
            { ...newGoal, userId: currentUser.uid }
          );
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}/goals/${newGoal.id}`);
        }
      }
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goalToDelete = goals.find((g) => g.id === goalId);
    if (!goalToDelete) return;
    if (
      window.confirm(
        `Are you sure you want to delete the goal "${goalToDelete.title}"? Associated tasks will be detached.`
      )
    ) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setTasks((prev) =>
        prev.map((t) => (t.goalId === goalId ? { ...t, goalId: undefined } : t))
      );

      if (currentUser) {
        try {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'goals', goalId));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `users/${currentUser.uid}/goals/${goalId}`);
        }
      }
    }
  };

  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  // Productivity Log Handler
  const handleSaveRecord = async (record: DailyProductivityRecord) => {
    setRecords((prev) => {
      const filtered = prev.filter((r) => r.date !== record.date);
      return [record, ...filtered];
    });

    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid, 'records', record.date),
          { ...record, userId: currentUser.uid }
        );
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}/records/${record.date}`);
      }
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setShowAuthScreen(true);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Reset all goals, tasks, and history to starter demo data?')) {
      const { goals: g, tasks: t, records: r } = resetToDemoData();
      setGoals(g);
      setTasks(t);
      setRecords(r);
    }
  };

  // Export / Import JSON data
  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: currentUser ? { email: currentUser.email, uid: currentUser.uid } : null,
      goals,
      tasks,
      records,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-goal-tracker-backup-${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.goals) && Array.isArray(parsed.tasks)) {
          setGoals(parsed.goals);
          setTasks(parsed.tasks);
          if (Array.isArray(parsed.records)) {
            setRecords(parsed.records);
          }
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup format.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Show Auth Screen if requested or user signed out
  if (showAuthScreen) {
    return (
      <AuthView
        onSuccess={() => setShowAuthScreen(false)}
        onContinueAsGuest={() => setShowAuthScreen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTask={() => handleOpenNewTask()}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuth={() => setShowAuthScreen(true)}
      />

      {/* Guest Mode Banner (if not logged in) */}
      {!currentUser && authChecked && (
        <div className="bg-neutral-900 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <span>You are currently in guest mode.</span>
          <button
            onClick={() => setShowAuthScreen(true)}
            className="underline font-semibold hover:text-neutral-200"
          >
            Sign in or Create an Account
          </button>
          <span>to sync across devices.</span>
        </div>
      )}

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Navigation */}
        <DateNavigation
          selectedDate={selectedDate}
          todayDate={todayDate}
          currentStreak={streakStats.currentStreak}
          onDateChange={setSelectedDate}
          onJumpToToday={() => setSelectedDate(todayDate)}
        />

        {/* View Routing */}
        <div className="mt-6">
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              {/* Daily Progress Bar & Circular Completion Gauge */}
              <DailyProgressBar progress={dayProgress} />

              {/* Task Checklist, Filters, Grouping, and Management */}
              <TaskList
                tasks={dayTasks}
                goals={goals}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onOpenNewTask={() => handleOpenNewTask()}
                onStartFocus={(t) => setFocusTimerTask(t)}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              tasks={tasks}
              onOpenNewGoal={handleOpenNewGoal}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddTaskForGoal={(goalId) => handleOpenNewTask(goalId)}
            />
          )}

          {activeTab === 'analytics' && (
            <ProgressAnalyticsView
              tasks={tasks}
              goals={goals}
              selectedDate={selectedDate}
              todayDate={todayDate}
              onSelectDate={(newDate) => setSelectedDate(newDate)}
            />
          )}

          {activeTab === 'log' && (
            <DailyLogView
              selectedDate={selectedDate}
              todayDate={todayDate}
              records={records}
              onSaveRecord={handleSaveRecord}
              onSelectDate={(newDate) => setSelectedDate(newDate)}
            />
          )}
        </div>
      </main>

      {/* 3. Quiet Footer with Backup & Reset Controls */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Daily Goal Tracker</span>
            <span aria-hidden="true">·</span>
            <span>
              {currentUser ? `Connected as ${currentUser.email || 'User'}` : 'Guest session active'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
              title="Export all data to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <label className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
              title="Reset data to initial demo state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        goals={goals}
        defaultDate={selectedDate}
        defaultGoalId={defaultGoalIdForNewTask}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={!!focusTimerTask}
        onClose={() => setFocusTimerTask(null)}
        task={focusTimerTask}
        onCompleteTask={(taskId) => {
          handleToggleComplete(taskId);
        }}
      />
    </div>
  );
}
