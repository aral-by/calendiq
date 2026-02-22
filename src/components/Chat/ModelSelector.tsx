import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type AIModel = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'gpt-4';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  // Determine which logo to show based on selected model
  const renderTriggerIcon = () => {
    if (selectedModel === 'gpt-4') {
      return (
        <img 
          src="/icons/openai-logo.svg" 
          alt="OpenAI"
          className="h-5 w-5 dark:invert"
        />
      );
    }
    // For llama models
    return (
      <img 
        src="/icons/llama-logo.png" 
        alt="Llama"
        className="h-5 w-5 dark:invert"
      />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          title="Select AI Model"
        >
          {renderTriggerIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        {/* Llama Models */}
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.3-70b-versatile')}
          className={`px-2 py-1.5 ${selectedModel === 'llama-3.3-70b-versatile' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Llama"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Llama 70B</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.1-8b-instant')}
          className={`px-2 py-1.5 ${selectedModel === 'llama-3.1-8b-instant' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Llama"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Llama 8B</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />
        
        {/* OpenAI Models - Not Available */}
        <DropdownMenuItem
          disabled
          className="px-2 py-1.5 opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/openai-logo.svg" 
              alt="OpenAI"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm text-muted-foreground">GPT-4</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
