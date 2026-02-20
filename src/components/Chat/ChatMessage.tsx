import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  // Parse AI response to show friendly message
  let aiDisplayMessage = message.aiResponse;
  
  try {
    // If aiResponse is JSON, parse it
    const parsed = JSON.parse(message.aiResponse || '{}');
    
    if (parsed.type === 'CREATE_EVENT') {
      aiDisplayMessage = `✓ I've created "${parsed.payload?.title}" for you.`;
    } else if (parsed.type === 'UPDATE_EVENT') {
      aiDisplayMessage = `✓ I've updated the event.`;
    } else if (parsed.type === 'DELETE_EVENT') {
      aiDisplayMessage = `✓ I've deleted the event.`;
    } else if (parsed.type === 'QUERY_EVENTS') {
      aiDisplayMessage = `Let me check your events...`;
    } else if (parsed.type === 'NO_ACTION') {
      aiDisplayMessage = parsed.message || 'How can I help you with your calendar?';
    } else if (parsed.message) {
      aiDisplayMessage = parsed.message;
    }
  } catch {
    // Keep original message if not JSON
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
      {/* User Message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
          <p className="text-sm font-light">{message.userMessage}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* AI Response */}
      {message.aiResponse && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 shrink-0 mt-1">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%]">
            <p className="text-sm font-light text-foreground">{aiDisplayMessage}</p>
            
            {/* Show action type badge if available */}
            {message.actionType && message.actionType !== 'NO_ACTION' && message.actionType !== 'ERROR' && (
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-950/50 text-xs text-purple-700 dark:text-purple-300 font-medium">
                {message.actionType.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
