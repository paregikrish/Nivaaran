import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthModal from './components/AuthModal';
import ResourcesModal from './components/ResourcesModal';
import { useChat } from './context/ChatContext';

export default function App() {
  const { startNewChat, setResourcesModalOpen } = useChat();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K = New Chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        startNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startNewChat]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#0d1117] font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatArea />
      </div>

      <AuthModal />
      <ResourcesModal />
    </div>
  );
}
