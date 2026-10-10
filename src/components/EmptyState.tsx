import React from 'react';
import { FilterType } from '../types';
import { CheckCircle2, ClipboardList, Sparkles, SearchX } from 'lucide-react';

interface EmptyStateProps {
  filter: FilterType;
  hasSearchQuery: boolean;
  onResetSearch: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  hasSearchQuery,
  onResetSearch,
}) => {
  if (hasSearchQuery) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No matching tasks</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          We couldn't find any tasks matching your search query.
        </p>
        <button
          onClick={onResetSearch}
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
        >
          Clear search filter
        </button>
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
          <CheckCircle2 className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No completed tasks yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Finish a task from your active list to see it marked here with a strikethrough.
        </p>
      </div>
    );
  }

  if (filter === 'active') {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">All caught up!</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          You don't have any pending active tasks. Enjoy your free time or add a new one above.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3.5 shadow-lg shadow-indigo-500/5">
        <ClipboardList className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">Your task list is empty</h3>
      <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
        Type a task into the box above and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">Enter</kbd> to get organized!
      </p>
    </div>
  );
};
