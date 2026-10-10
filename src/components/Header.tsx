import React from 'react';
import { User } from 'firebase/auth';
import { CheckSquare, Cloud, CloudOff, LogIn, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  authLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  authLoading,
  onLogin,
  onLogout,
  isSyncing,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                TaskFlow
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Modern task workspace & persistent cloud sync
            </p>
          </div>
        </div>

        {/* Sync & Auth Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/60 rounded-full py-1 px-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {isSyncing ? 'Syncing...' : 'Firestore Synced'}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-700" />

              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-600"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-[11px] font-bold text-white flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-slate-200 font-medium max-w-[120px] truncate hidden sm:inline">
                  {user.displayName || user.email}
                </span>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-full hover:bg-slate-700/50"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Guest Mode (Local)</span>
              </div>

              <button
                onClick={onLogin}
                disabled={authLoading}
                className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm hover:shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
              >
                {/* Google "G" Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
