import { useState, KeyboardEvent } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
}

export function ChatInput({ onSend, loading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    if (!message.trim() || loading) return;

    const messageToSend = message.trim();
    setMessage('');
    await onSend(messageToSend);
  }

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI to manage your calendar..."
            disabled={loading}
            className="h-11 text-base"
          />
          {!navigator.onLine && (
            <p className="text-xs text-destructive mt-1 animate-in fade-in">
              You're offline. AI features require internet connection.
            </p>
          )}
        </div>
        
        {/* Voice button - Phase 6 */}
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0"
          disabled
          title="Voice input coming soon"
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !message.trim() || !navigator.onLine}
          size="icon"
          className="h-11 w-11 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
