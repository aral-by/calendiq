import { Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type AIModel = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          title="Select AI Model"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.3-70b-versatile')}
          className={selectedModel === 'llama-3.3-70b-versatile' ? 'bg-accent' : ''}
        >
          <div className="flex flex-col gap-1">
            <div className="font-medium">70B Versatile</div>
            <div className="text-xs text-muted-foreground">Smarter • 100K tokens/day</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.1-8b-instant')}
          className={selectedModel === 'llama-3.1-8b-instant' ? 'bg-accent' : ''}
        >
          <div className="flex flex-col gap-1">
            <div className="font-medium">8B Instant</div>
            <div className="text-xs text-muted-foreground">Faster • 1M tokens/day</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
