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
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 p-2 pr-3 rounded-full border bg-background shadow-sm focus-within:shadow-md transition-shadow">
          {/* Voice button - Phase 6 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            disabled
            title="Voice input coming soon"
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Herhangi bir şey sor"
            disabled={loading}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-base font-light px-2"
          />

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !message.trim() || !navigator.onLine}
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!navigator.onLine && (
          <p className="text-xs text-destructive mt-2 text-center animate-in fade-in">
            You're offline. AI features require internet connection.
          </p>
        )}
      </div>
    </div>
  );
}
