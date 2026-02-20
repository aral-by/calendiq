import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { Sparkles } from 'lucide-react';

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* User Message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="bg-muted/80 px-5 py-3 rounded-3xl rounded-tr-md max-w-[85%] shadow-sm">
          <p className="text-[15px] font-light leading-relaxed">{message.userMessage}</p>
        </div>
      </div>

      {/* AI Response */}
      {message.aiResponse && (
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 max-w-[85%]">
            <p className="text-[15px] font-light leading-relaxed text-foreground/90">{aiDisplayMessage}</p>
            
            {/* Show action type badge if available */}
            {message.actionType && message.actionType !== 'NO_ACTION' && message.actionType !== 'ERROR' && (
              <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-purple-100/80 dark:bg-purple-950/50 text-[11px] text-purple-700 dark:text-purple-300 font-medium border border-purple-200/50 dark:border-purple-800/50">
                {message.actionType.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
