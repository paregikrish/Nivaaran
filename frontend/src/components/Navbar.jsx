import React from 'react';
import { Menu, BookOpen, Sparkles, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function Navbar() {
  const { user, isAuthenticated, openAuth, logout } = useAuth();
  const { setSidebarOpen, setResourcesModalOpen, startNewChat } = useChat();

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Nivaaran Logo & SDG Badge */}
        <div
          onClick={startNewChat}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            नि
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-900 dark:text-white tracking-tight text-base">
                Nivaaran
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full border border-emerald-300/40">
                SDG 1 No Poverty
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block -mt-0.5">
              Understand Money. Build a Better Future.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Verified Resources button */}
        <button
          onClick={() => setResourcesModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Verified Schemes</span>
        </button>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Auth status / trigger */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-200 truncate max-w-[120px]">
                {user.full_name}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuth('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all hover:shadow"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
