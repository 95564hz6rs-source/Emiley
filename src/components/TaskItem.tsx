import React, { useState, useRef, useEffect } from 'react';
import { TaskItem as TaskType, Priority } from '../types';
import { Check, Trash2, Edit2, CheckSquare, Square, Flag, Tag, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskItemProps {
  task: TaskType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newTitle: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = (e: React.MouseEvent) => {
    if (!task.completed) {
      // Trigger subtle micro confetti from checkbox position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 24,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
        ticks: 120,
        gravity: 1.1,
        scalar: 0.7,
      });
    }
    onToggle(task.id);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdate(task.id, editTitle.trim());
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getPriorityBadge = (p?: Priority) => {
    switch (p) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flag className="w-2.5 h-2.5" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Flag className="w-2.5 h-2.5" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Flag className="w-2.5 h-2.5" /> Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-75 hover:opacity-100'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md hover:shadow-black/20'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={task.completed ? 'Mark task incomplete' : 'Mark task completed'}
        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
          task.completed
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
            : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent hover:text-slate-500'
        }`}
      >
        <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-800 border border-indigo-500 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none"
              maxLength={300}
            />
            <button
              onClick={handleSaveEdit}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg shrink-0 cursor-pointer"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <p
              onDoubleClick={() => !task.completed && setIsEditing(true)}
              className={`text-sm sm:text-base leading-snug break-words transition-all select-none cursor-pointer ${
                task.completed
                  ? 'line-through text-slate-500 decoration-slate-500/80 decoration-2'
                  : 'text-slate-100 font-medium'
              }`}
              title="Double click to edit task"
            >
              {task.title}
            </p>

            {/* Badges / Metadata row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {getPriorityBadge(task.priority)}

              {task.category && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Tag className="w-2.5 h-2.5" />
                  {task.category}
                </span>
              )}

              {task.createdAt && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTime(task.createdAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!task.completed && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
