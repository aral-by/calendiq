import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentSession: ChatSession | null;
  createNewSession: () => string;
  switchSession: (sessionId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('calendiq_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('calendiq_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const createNewSession = (): string => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const addMessage = (message: ChatMessage) => {
    if (!currentSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id !== currentSessionId) return session;

      const updatedMessages = [...session.messages, message];
      
      // Auto-generate title from first user message
      let newTitle = session.title;
      if (session.title === 'New Chat' && message.role === 'user' && session.messages.length === 0) {
        newTitle = message.content.length > 40 
          ? message.content.substring(0, 40) + '...'
          : message.content;
      }

      return {
        ...session,
        messages: updatedMessages,
        title: newTitle,
        updatedAt: Date.now(),
      };
    }));
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, title, updatedAt: Date.now() }
        : session
    ));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        sessions,
        currentSessionId,
        currentSession,
        createNewSession,
        switchSession,
        addMessage,
        updateSessionTitle,
        deleteSession,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within ChatHistoryProvider');
  }
  return context;
}
