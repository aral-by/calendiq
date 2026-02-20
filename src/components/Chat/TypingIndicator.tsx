import { Loader2 } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-2xl max-w-fit animate-in fade-in slide-in-from-bottom duration-300">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground font-light">AI is thinking...</span>
    </div>
  );
}
