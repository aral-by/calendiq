import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type AIModel = 
  | 'openai/gpt-oss-120b'
  | 'llama-3.3-70b-versatile' 
  | 'llama-3.1-8b-instant' 
  | 'llama-3.2-90b-text-preview' 
  | 'llama-3.2-11b-text-preview'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  // Determine which logo to show based on selected model
  const renderTriggerIcon = () => {
    if (selectedModel.startsWith('openai/gpt-oss')) {
      // DeepSeek model
      return (
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">DS</span>
        </div>
      );
    }
    if (selectedModel.startsWith('mixtral')) {
      // Use a distinct icon for Mixtral (we could add a Mistral logo later)
      return (
        <img 
          src="/icons/llama-logo.png" 
          alt="Mixtral"
          className="h-5 w-5 dark:invert"
        />
      );
    }
    if (selectedModel.startsWith('gemma')) {
      // Use a distinct icon for Gemma (we could add a Google/Gemma logo later)
      return (
        <img 
          src="/icons/llama-logo.png" 
          alt="Gemma"
          className="h-5 w-5 dark:invert"
        />
      );
    }
    // For llama models (default)
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
      <DropdownMenuContent align="start" className="w-48">
        {/* DeepSeek V3 - Premium Model */}
        <DropdownMenuItem
          onClick={() => onModelChange('openai/gpt-oss-120b')}
          className={`px-2 py-1.5 ${selectedModel === 'openai/gpt-oss-120b' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">DS</span>
            </div>
            <span className="text-sm font-medium">DeepSeek V3 120B</span>
            <span className="ml-auto text-[10px] text-muted-foreground">GPT-4</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />
        
        {/* Llama 3.3 Models */}
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
        
        {/* Llama 3.2 Models */}
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.2-90b-text-preview')}
          className={`px-2 py-1.5 ${selectedModel === 'llama-3.2-90b-text-preview' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Llama"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Llama 90B</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.2-11b-text-preview')}
          className={`px-2 py-1.5 ${selectedModel === 'llama-3.2-11b-text-preview' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Llama"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Llama 11B</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />
        
        {/* Other Models */}
        <DropdownMenuItem
          onClick={() => onModelChange('mixtral-8x7b-32768')}
          className={`px-2 py-1.5 ${selectedModel === 'mixtral-8x7b-32768' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Mixtral"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Mixtral 8x7B</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('gemma2-9b-it')}
          className={`px-2 py-1.5 ${selectedModel === 'gemma2-9b-it' ? 'bg-accent' : ''}`}
        >
          <div className="flex items-center gap-1.5">
            <img 
              src="/icons/llama-logo.png" 
              alt="Gemma"
              className="h-3.5 w-3.5 dark:invert"
            />
            <span className="text-sm">Gemma 9B</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
