import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ArrowUp } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageInput() {
  const { sendMessage, isGenerating, error } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const quickChips = [
    'Explain in simpler words',
    'Give a real-world example',
    'Which govt scheme applies?',
    'Is this message a scam?',
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const appendChip = (chipText) => {
    setInput((prev) => (prev ? `${prev} — ${chipText}` : chipText));
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="p-3 md:p-4 max-w-4xl mx-auto w-full">
      {/* Error alert if any */}
      {error && (
        <div className="mb-2 p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => appendChip(chip)}
            className="shrink-0 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-[#161b22] hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-gray-200/80 dark:border-gray-800 rounded-full transition-colors shadow-2xs"
          >
            + {chip}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-[#161b22] border border-gray-300/80 dark:border-gray-700/80 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 rounded-2xl shadow-sm focus-within:shadow-md transition-all p-2 flex flex-col"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nivaaran anything about saving, budgeting, public schemes, or scam safety..."
          rows={1}
          disabled={isGenerating}
          className="w-full resize-none bg-transparent px-3 py-1.5 text-xs md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed min-h-[42px] max-h-[180px]"
        />

        <div className="flex items-center justify-between pt-1 px-2">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 text-[10px]">Enter ↵</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 text-[10px]">Shift+Enter</kbd> for newline
          </span>

          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className={`
              p-2 rounded-xl text-white transition-all shadow-sm
              ${
                input.trim() && !isGenerating
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 scale-100'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60'
              }
            `}
            aria-label="Send message"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
