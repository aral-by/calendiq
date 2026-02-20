import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { MessageSquare } from 'lucide-react';

interface ChatHistoryProps {
  messages: ChatMessageType[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-4 bg-purple-100 dark:bg-purple-950 rounded-full mb-4">
          <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start a conversation with your AI assistant to manage your calendar.
        </p>
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium">Try asking:</p>
          <ul className="space-y-1 text-left">
            <li>• "Yarın saat 15'te doktor randevum var"</li>
            <li>• "Pazartesi 10'da toplantı ekle"</li>
            <li>• "Bu haftaki planlarımı göster"</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
