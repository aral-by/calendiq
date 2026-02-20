import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ChatMessage } from '@/types/chat';
import type { AIAction } from '@/types/ai';
import { IndexedDBChatRepository } from '@/db/repositories';
import { AIActionSchema } from '@/types/ai';

interface ChatContextValue {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (message: string) => Promise<AIAction | null>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const chatRepo = new IndexedDBChatRepository();

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const history = await chatRepo.getAll();
      setMessages(history);
      console.log('[Chat] Loaded', history.length, 'messages');
    } catch (error) {
      console.error('[Chat] Error loading history:', error);
    }
  }

  async function sendMessage(message: string): Promise<AIAction | null> {
    if (!message.trim()) return null;
    
    setLoading(true);
    
    try {
      // Check if online
      if (!navigator.onLine) {
        console.warn('[Chat] Offline - cannot send message to AI');
        return null;
      }

      // Call AI endpoint
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate with Zod
      const validatedAction = AIActionSchema.parse(data.action);

      // Save to chat history
      await chatRepo.create({
        userMessage: message,
        aiResponse: JSON.stringify(validatedAction),
        timestamp: new Date().toISOString(),
        actionType: validatedAction.type,
        actionPayload: 'payload' in validatedAction ? validatedAction.payload : null,
      });

      // Reload history
      await loadHistory();
      
      console.log('[Chat] AI action:', validatedAction.type);
      return validatedAction;
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      
      // Save error message to chat
      await chatRepo.create({
        userMessage: message,
        aiResponse: 'Sorry, I encountered an error. Please try again or use manual event creation.',
        timestamp: new Date().toISOString(),
        actionType: 'ERROR',
        actionPayload: null,
      });
      
      await loadHistory();
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await chatRepo.clear();
      setMessages([]);
      console.log('[Chat] History cleared');
    } catch (error) {
      console.error('[Chat] Error clearing history:', error);
    }
  }

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        loading, 
        sendMessage, 
        loadHistory,
        clearHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
