/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import {
  subscribeToUserTasks,
  createFirestoreTask,
  updateFirestoreTask,
  deleteFirestoreTask,
} from './services/taskService';
import { FilterType, Priority, TaskItem } from './types';
import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskInput } from './components/TaskInput';
import { TaskFilters } from './components/TaskFilters';
import { TaskItem as TaskItemComponent } from './components/TaskItem';
import { EmptyState } from './components/EmptyState';
import { Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'taskflow_guest_tasks';

const DEFAULT_STARTER_TASKS: TaskItem[] = [
  {
    id: 'task-starter-1',
    title: 'Welcome to TaskFlow! Click the checkmark to mark as completed',
    completed: false,
    userId: 'guest',
    category: 'Personal',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-starter-2',
    title: 'Filter tasks by All, Active, or Completed using the tabs below',
    completed: false,
    userId: 'guest',
    category: 'Work',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'task-starter-3',
    title: 'Sign in with Google to enable real-time Firebase cloud synchronization',
    completed: true,
    userId: 'guest',
    category: 'Ideas',
    priority: 'low',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core task list state (React useState as requested)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
    return DEFAULT_STARTER_TASKS;
  });

  // Filter & Search state
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'alphabetical'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // If user logged in and has local guest tasks, offer migration
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            const guestTasks: TaskItem[] = JSON.parse(localData);
            if (guestTasks.length > 0) {
              setSyncNotice(
                `Found ${guestTasks.length} local task(s). Would you like to upload them to your Google Account?`
              );
            }
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!user) {
      // In guest mode, persist tasks to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }
      return;
    }

    setIsSyncing(true);
    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (cloudTasks) => {
        setTasks(cloudTasks);
        setIsSyncing(false);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // Revert to local storage tasks
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        } else {
          setTasks(DEFAULT_STARTER_TASKS);
        }
      } catch {
        setTasks(DEFAULT_STARTER_TASKS);
      }
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Import Guest Tasks to Firestore
  const handleMigrateGuestTasks = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        const guestTasks: TaskItem[] = JSON.parse(localData);
        for (const t of guestTasks) {
          await createFirestoreTask(user.uid, {
            title: t.title,
            category: t.category,
            priority: t.priority,
          });
        }
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      setSyncNotice(null);
    } catch (e) {
      console.error('Migration failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Task
  const handleAddTask = async (
    title: string,
    category?: string,
    priority?: Priority
  ) => {
    if (!title.trim()) return;

    if (user) {
      try {
        setIsSubmitting(true);
        await createFirestoreTask(user.uid, {
          title,
          category,
          priority,
        });
      } catch (err) {
        console.error('Error creating Firestore task:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local state update
      const newTask: TaskItem = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title,
        completed: false,
        userId: 'guest',
        category,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextState = !target.completed;

    if (user) {
      try {
        await updateFirestoreTask(user.uid, id, { completed: nextState });
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    } else {
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, completed: nextState, updatedAt: new Date().toISOString() } : t
      );
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    if (user) {
      try {
        await deleteFirestoreTask(user.uid, id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    } else {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Update Task Title
  const handleUpdateTask = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    if (user) {
      try {
        await updateFirestoreTask(user.uid, id, { title: newTitle.trim() });
      } catch (err) {
        console.error('Failed to update task title:', err);
      }
    } else {
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, title: newTitle.trim(), updatedAt: new Date().toISOString() } : t
      );
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Batch: Mark All Complete
  const handleMarkAllComplete = async () => {
    const pendingTasks = tasks.filter((t) => !t.completed);
    if (pendingTasks.length === 0) return;

    if (user) {
      for (const t of pendingTasks) {
        await updateFirestoreTask(user.uid, t.id, { completed: true }).catch(() => {});
      }
    } else {
      const updated = tasks.map((t) => ({ ...t, completed: true }));
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Batch: Clear Completed
  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    if (user) {
      for (const t of completedTasks) {
        await deleteFirestoreTask(user.uid, t.id).catch(() => {});
      }
    } else {
      const updated = tasks.filter((t) => !t.completed);
      setTasks(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Distinct categories available in tasks
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Metrics
  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Filtered and Sorted Tasks
  const displayedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Filter by status (All / Active / Completed)
    if (filter === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // 2. Filter by category
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // 3. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.category && t.category.toLowerCase().includes(query))
      );
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateA - dateB;
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const weightA = a.priority ? priorityWeight[a.priority] : 0;
        const weightB = b.priority ? priorityWeight[b.priority] : 0;
        return weightB - weightA;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [tasks, filter, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        user={user}
        authLoading={authLoading}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Auth Error Banner if any */}
        {authError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sync Migration Banner */}
        {syncNotice && (
          <div className="bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleMigrateGuestTasks}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                Upload to Cloud
              </button>
              <button
                onClick={() => setSyncNotice(null)}
                className="text-slate-400 hover:text-white px-2 py-1.5 text-xs transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Guest Callout when not logged in */}
        {!user && !authLoading && (
          <div className="bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-slate-900/30 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Real-time Cloud Sync Ready
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                You're currently using guest mode. Sign in with Google to synchronize tasks seamlessly across your computer, tablet, and mobile device.
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
            >
              <span>Connect Google</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Task Input Section */}
        <section aria-label="Add task input">
          <TaskInput onAddTask={handleAddTask} isSubmitting={isSubmitting} />
        </section>

        {/* Statistics & Progress */}
        <section aria-label="Task progress statistics">
          <TaskStats
            totalCount={totalCount}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={handleClearCompleted}
            onMarkAllComplete={handleMarkAllComplete}
          />
        </section>

        {/* Filter Toolbar (All, Active, Completed, Search, Sort) */}
        <section aria-label="Task filters">
          <TaskFilters
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={{ all: totalCount, active: activeCount, completed: completedCount }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            availableCategories={availableCategories}
          />
        </section>

        {/* Task List Items */}
        <section aria-label="Task list" className="space-y-2.5">
          {displayedTasks.length > 0 ? (
            displayedTasks.map((task) => (
              <TaskItemComponent
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
              />
            ))
          ) : (
            <EmptyState
              filter={filter}
              hasSearchQuery={Boolean(searchQuery.trim())}
              onResetSearch={() => setSearchQuery('')}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} TaskFlow • Powered by Firebase Firestore & Google Auth</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Ready for GitHub & Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
