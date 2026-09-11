import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCw, Sparkles, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function MessageItem({ message, isLastAssistant, isGenerating }) {
  const { user } = useAuth();
  const { regenerateLastResponse } = useChat();
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      className={`
        flex gap-3 md:gap-4 py-4 px-3 md:px-6 rounded-2xl transition-colors
        ${
          isUser
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 ml-auto max-w-[88%] md:max-w-[78%]'
            : 'bg-transparent mr-auto w-full'
        }
      `}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            {user?.full_name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-500/20">
            नि
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Name and Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
              {isUser ? user?.full_name || 'You' : 'Nivaaran AI'}
            </span>
            {!isUser && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded font-medium border border-emerald-300/30">
                Financial Inclusion
              </span>
            )}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {formattedTime}
            </span>
          )}
        </div>

        {/* Markdown Content */}
        <div className="markdown-body text-gray-800 dark:text-gray-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* AI Action Toolbar (Copy & Regenerate) */}
        {!isUser && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isLastAssistant && (
                <button
                  onClick={regenerateLastResponse}
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Regenerate this response"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            {/* Micro disclaimer */}
            <span className="text-[10px] text-gray-400 italic">
              General financial education • Not professional advice
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
