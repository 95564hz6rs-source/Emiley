import React from 'react';
import { CheckCircle2, Circle, ListTodo, Trash2, CheckCheck } from 'lucide-react';

interface TaskStatsProps {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
  onMarkAllComplete: () => void;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  totalCount,
  activeCount,
  completedCount,
  onClearCompleted,
  onMarkAllComplete,
}) => {
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
        {/* Metric counts */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 text-xs mb-0.5">
              <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
              <span>Total</span>
            </div>
            <div className="text-xl font-bold text-white">{totalCount}</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 text-xs mb-0.5">
              <Circle className="w-3.5 h-3.5 text-amber-400" />
              <span>Active</span>
            </div>
            <div className="text-xl font-bold text-amber-400">{activeCount}</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400 text-xs mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Done</span>
            </div>
            <div className="text-xl font-bold text-emerald-400">{completedCount}</div>
          </div>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {activeCount > 0 && (
            <button
              onClick={onMarkAllComplete}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/30 transition cursor-pointer"
              title="Mark all tasks as completed"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Complete All</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-rose-500/30 transition cursor-pointer"
              title="Remove all completed tasks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Overall Progress</span>
          <span className="font-semibold text-slate-200">
            {percentComplete}%
            {percentComplete === 100 && totalCount > 0 && (
              <span className="ml-1.5 text-emerald-400 font-normal">All caught up! 🎉</span>
            )}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
};
