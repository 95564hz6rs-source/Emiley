import React from 'react';
import { FilterType } from '../types';
import { Search, X, ArrowDownUp } from 'lucide-react';

interface TaskFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'newest' | 'oldest' | 'priority' | 'alphabetical';
  onSortChange: (sort: 'newest' | 'oldest' | 'priority' | 'alphabetical') => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  availableCategories: string[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  currentFilter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onSelectCategory,
  availableCategories,
}) => {
  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Toggle Buttons (All, Active, Completed) */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {filterTabs.map((tab) => {
            const isActive = currentFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowDownUp className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-slate-900 text-white">Newest</option>
                <option value="oldest" className="bg-slate-900 text-white">Oldest</option>
                <option value="priority" className="bg-slate-900 text-white">Priority</option>
                <option value="alphabetical" className="bg-slate-900 text-white">A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills (if any exist) */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] shrink-0 font-medium">Filter by tag:</span>
          <button
            onClick={() => onSelectCategory('')}
            className={`px-2 py-0.5 rounded-lg border text-xs whitespace-nowrap cursor-pointer transition ${
              selectedCategory === ''
                ? 'bg-slate-800 text-white border-slate-700 font-medium'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            All tags
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(selectedCategory === cat ? '' : cat)}
              className={`px-2 py-0.5 rounded-lg border text-xs whitespace-nowrap cursor-pointer transition ${
                selectedCategory === cat
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
