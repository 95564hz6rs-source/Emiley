import React, { useState } from 'react';
import { Plus, Tag, Flag, CornerDownLeft } from 'lucide-react';
import { Priority } from '../types';

interface TaskInputProps {
  onAddTask: (title: string, category?: string, priority?: Priority) => void;
  isSubmitting?: boolean;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Ideas', 'Urgent'];

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    onAddTask(
      title.trim(),
      category ? category : undefined,
      priority
    );
    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 300))}
          placeholder="What needs to get done today? (Press Enter)..."
          className="flex-1 bg-transparent border-0 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-0 px-2 py-1.5"
          disabled={isSubmitting}
          autoFocus
        />

        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
            showOptions || category
              ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle category & priority tags"
        >
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Options</span>
        </button>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
          <CornerDownLeft className="w-3 h-3 opacity-60 ml-0.5 hidden sm:inline" />
        </button>
      </div>

      {/* Optional Metadata Row (Tags, Priority) */}
      {showOptions && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Priority options */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Flag className="w-3 h-3" /> Priority:
            </span>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const active = priority === p;
              const colorClasses =
                p === 'high'
                  ? active
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'text-slate-400 hover:text-rose-400 border-slate-800'
                  : p === 'medium'
                  ? active
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-400 border-slate-800'
                  : active
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'text-slate-400 hover:text-sky-400 border-slate-800';

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`capitalize px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${colorClasses}`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Category tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tag:
            </span>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(active ? '' : cat)}
                  className={`px-2 py-0.5 rounded-md border text-xs transition cursor-pointer ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-medium'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {title.length > 240 && (
        <div className="mt-1 text-right text-[11px] text-amber-400">
          {title.length} / 300 characters
        </div>
      )}
    </form>
  );
};
