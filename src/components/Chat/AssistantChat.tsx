import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUp } from 'lucide-react';

export function AssistantChat() {
  const [message, setMessage] = useState('');

  const examplePrompts = [
    "Yarın saat 15'te doktor randevum var",
    "Pazartesi 10'da toplantı ekle",
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // TODO: API call
    console.log('Send:', message);
    setMessage('');
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1">
        {/* Welcome Screen */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Merhaba!</h1>
            <p className="text-xl text-muted-foreground">Bugün size nasıl yardımcı olabilirim?</p>
          </div>

          {/* Example Prompts */}
          <div className="w-full grid grid-cols-2 gap-3">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="p-4 rounded-2xl border border-border bg-card hover:bg-accent transition-colors text-left"
              >
                <p className="text-sm text-card-foreground">{prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full pb-4">
          <div className="relative flex items-center gap-3 rounded-3xl border border-border bg-background p-4 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="shrink-0 rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
