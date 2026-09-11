import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, isAuthenticated, openAuth } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user conversations whenever authentication state changes
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setCurrentConversation(null);
      setCurrentConversationId(null);
      return;
    }
    setLoadingConversations(true);
    try {
      const list = await api.getConversations();
      setConversations(list);
      if (list.length > 0 && !currentConversationId) {
        // Select the most recently updated conversation
        selectConversation(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated, currentConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [isAuthenticated]);

  // Load active conversation details
  const selectConversation = async (convId) => {
    if (!convId) {
      setCurrentConversationId(null);
      setCurrentConversation(null);
      return;
    }
    setCurrentConversationId(convId);
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await api.getConversation(convId);
      setCurrentConversation(detail);
      // Close sidebar on mobile upon selection
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
      setError('Failed to load conversation.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Start fresh conversation (New Chat)
  const startNewChat = () => {
    setCurrentConversationId(null);
    setCurrentConversation(null);
    setError(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  // Send message
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    setIsGenerating(true);
    setError(null);

    // If starting from a blank new chat screen
    if (!currentConversationId) {
      try {
        const newConv = await api.createConversation({
          title: 'New Financial Conversation',
          initial_message: content.trim(),
        });
        setCurrentConversationId(newConv.id);
        setCurrentConversation(newConv);
        await fetchConversations();
      } catch (err) {
        console.error('Failed to create conversation with message:', err);
        setError(err.message || 'Failed to send message.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Optimistically add user message to current state
    const optimisticUserMsg = {
      id: 'temp-' + Date.now(),
      conversation_id: currentConversationId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setCurrentConversation((prev) => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticUserMsg],
    }));

    try {
      const assistantMsg = await api.sendMessage(currentConversationId, content.trim());
      
      // Update messages with actual server assistant response
      setCurrentConversation((prev) => {
        if (!prev) return null;
        // Replace temp msg with real messages list
        const filtered = prev.messages.filter((m) => !m.id.startsWith('temp-'));
        return {
          ...prev,
          messages: [...filtered, optimisticUserMsg, assistantMsg],
        };
      });

      // Refresh list to update titles/previews
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to get AI response.');
      // Re-fetch conversation to sync true state
      if (currentConversationId) {
        api.getConversation(currentConversationId).then(setCurrentConversation);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate last response
  const regenerateLastResponse = async () => {
    if (!currentConversationId || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const newAssistantMsg = await api.regenerateMessage(currentConversationId);
      setCurrentConversation((prev) => {
        if (!prev) return null;
        const msgs = [...prev.messages];
        if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
          msgs.pop();
        }
        return {
          ...prev,
          messages: [...msgs, newAssistantMsg],
        };
      });
    } catch (err) {
      console.error('Failed to regenerate response:', err);
      setError(err.message || 'Failed to regenerate response.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Rename conversation
  const renameConversation = async (convId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const updated = await api.renameConversation(convId, newTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: updated.title } : c))
      );
      if (currentConversationId === convId) {
        setCurrentConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  // Delete conversation
  const deleteConversation = async (convId) => {
    try {
      await api.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConversationId === convId) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentConversation,
        isGenerating,
        loadingConversations,
        loadingDetail,
        error,
        resourcesModalOpen,
        setResourcesModalOpen,
        sidebarOpen,
        setSidebarOpen,
        selectConversation,
        startNewChat,
        sendMessage,
        regenerateLastResponse,
        renameConversation,
        deleteConversation,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
