import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  BookOpen,
  LogOut,
  Shield,
  Coins,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function Sidebar() {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const {
    conversations,
    currentConversationId,
    selectConversation,
    startNewChat,
    deleteConversation,
    renameConversation,
    setResourcesModalOpen,
    sidebarOpen,
    setSidebarOpen,
  } = useChat();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const startRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (convId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const confirmDelete = (convId, e) => {
    e.stopPropagation();
    setDeleteConfirmId(convId);
  };

  const executeDelete = (convId, e) => {
    e.stopPropagation();
    deleteConversation(convId);
    setDeleteConfirmId(null);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 md:w-64 lg:w-72
          bg-slate-50 dark:bg-[#090d16]
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-emerald-600/30">
              नि
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-tight flex items-center gap-1.5">
                Nivaaran
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-semibold px-1.5 py-0.2 rounded border border-emerald-300/40">
                  SDG 1
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Financial Inclusion</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: New Chat & Public Resources */}
        <div className="p-3 space-y-2">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:shadow group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-150" />
              <span>New Conversation</span>
            </div>
            <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded text-emerald-100 hidden sm:inline">
              Ctrl+K
            </span>
          </button>

          <button
            onClick={() => {
              setResourcesModalOpen(true);
              if (window.innerWidth < 768) setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-[#161b22] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-300 font-medium text-xs rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="truncate">Public Schemes & Helplines</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Recent Conversations
          </div>

          {!isAuthenticated ? (
            <div className="p-4 mx-1 rounded-xl bg-white/60 dark:bg-gray-800/30 border border-gray-200/60 dark:border-gray-800/60 text-center">
              <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Sign in to save history</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 mb-2.5">
                Your conversations will be safely stored across devices.
              </p>
              <button
                onClick={() => openAuth('login')}
                className="w-full py-1.5 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Sign In / Register
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 italic">
              No conversations yet. Start a new chat above!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = currentConversationId === conv.id;
              const isEditing = editingId === conv.id;
              const isDeleting = deleteConfirmId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`
                    group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all
                    ${
                      isActive
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-medium border border-emerald-300/40 dark:border-emerald-800/60'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                      }`}
                    />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(conv.id, e);
                          if (e.key === 'Escape') cancelRename(e);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded border border-emerald-500 text-xs outline-none"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {/* Inline Action Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveRename(conv.id, e)}
                          title="Save title"
                          className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 text-gray-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          title="Cancel"
                          className="p-1 hover:text-gray-700 dark:hover:text-gray-300 text-gray-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : isDeleting ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/80 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        <span className="text-[10px] text-red-600 dark:text-red-300 font-semibold">
                          Delete?
                        </span>
                        <button
                          onClick={(e) => executeDelete(conv.id, e)}
                          title="Confirm delete"
                          className="text-red-600 hover:text-red-700 p-0.5"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelDelete}
                          title="Cancel"
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => startRename(conv, e)}
                          title="Rename title"
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => confirmDelete(conv.id, e)}
                          title="Delete chat"
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User Account / Footer Area */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-[#0c1017]">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => openAuth('register')}
                className="w-full py-2 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors"
              >
                Create Free Account
              </button>
            </div>
          )}

          {/* SDG 1 Badge */}
          <div className="mt-2.5 pt-2 border-t border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              SDG 1: No Poverty
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
