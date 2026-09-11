import React, { useEffect, useRef } from 'react';
import WelcomeHero from './WelcomeHero';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { useChat } from '../context/ChatContext';
import { Loader2 } from 'lucide-react';

export default function ChatArea() {
  const { currentConversation, isGenerating, loadingDetail } = useChat();
  const messagesEndRef = useRef(null);

  const messages = currentConversation?.messages || [];
  const showWelcome = messages.length === 0;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-white dark:bg-[#0d1117] overflow-hidden relative">
      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-2 md:px-6 py-4">
        {loadingDetail ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-xs">Loading conversation history...</p>
          </div>
        ) : showWelcome ? (
          <WelcomeHero />
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, index) => (
              <MessageItem
                key={msg.id || index}
                message={msg}
                isLastAssistant={
                  !isGenerating &&
                  index === messages.length - 1 &&
                  msg.role === 'assistant'
                }
                isGenerating={isGenerating}
              />
            ))}

            {/* AI Typing / Thinking Indicator */}
            {isGenerating && (
              <div className="flex gap-3 md:gap-4 py-4 px-3 md:px-6 rounded-2xl bg-transparent mr-auto w-full animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-500/20 shrink-0">
                  नि
                </div>
                <div className="flex flex-col gap-2 pt-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Nivaaran is crafting a thoughtful financial response...</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-3 rounded-xl bg-gray-100/70 dark:bg-gray-800/40 w-24">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Bottom Bar */}
      <div className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-sm shrink-0">
        <MessageInput />
      </div>
    </main>
  );
}
