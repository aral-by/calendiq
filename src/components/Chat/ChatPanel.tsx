import { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useEvents } from '@/context/EventContext';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { isCreateEventAction, isUpdateEventAction, isDeleteEventAction } from '@/types/ai';

export function ChatPanel() {
  const { messages, loading, sendMessage, loadHistory } = useChat();
  const { createEvent, updateEvent, deleteEvent } = useEvents();

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSendMessage(message: string) {
    const action = await sendMessage(message);
    
    if (!action) {
      console.log('[Chat] No action returned or error occurred');
      return;
    }

    // Execute action based on type
    try {
      if (isCreateEventAction(action)) {
        console.log('[Chat] Creating event:', action.payload.title);
        await createEvent({
          ...action.payload,
          allDay: action.payload.allDay ?? false,
          status: 'confirmed',
        });
      } else if (isUpdateEventAction(action)) {
        console.log('[Chat] Updating event:', action.id);
        await updateEvent(action.id, action.payload);
      } else if (isDeleteEventAction(action)) {
        console.log('[Chat] Deleting event:', action.id);
        await deleteEvent(action.id);
      }
      // QUERY_EVENTS and NO_ACTION don't need execution
    } catch (error) {
      console.error('[Chat] Error executing action:', error);
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-2xl font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground font-light">
          Chat with AI to manage your calendar
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatHistory messages={messages} />
        
        {/* Typing Indicator */}
        {loading && (
          <div className="px-4 pb-4">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} loading={loading} />
    </div>
  );
}
