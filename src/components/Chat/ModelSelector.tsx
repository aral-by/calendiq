import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full"
          title="Select AI Model"
        >
          <Brain className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        {/* DeepSeek V3 - Premium Model */}
        <DropdownMenuItem
          onClick={() => onModelChange('openai/gpt-oss-120b')}
          className={`px-1.5 py-1 ${selectedModel === 'openai/gpt-oss-120b' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">DeepSeek V3</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-0.5" />
        
        {/* Llama Models */}
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.3-70b-versatile')}
          className={`px-1.5 py-1 ${selectedModel === 'llama-3.3-70b-versatile' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Llama 70B</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.1-8b-instant')}
          className={`px-1.5 py-1 ${selectedModel === 'llama-3.1-8b-instant' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Llama 8B</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.2-90b-text-preview')}
          className={`px-1.5 py-1 ${selectedModel === 'llama-3.2-90b-text-preview' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Llama 90B</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('llama-3.2-11b-text-preview')}
          className={`px-1.5 py-1 ${selectedModel === 'llama-3.2-11b-text-preview' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Llama 11B</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-0.5" />
        
        {/* Other Models */}
        <DropdownMenuItem
          onClick={() => onModelChange('mixtral-8x7b-32768')}
          className={`px-1.5 py-1 ${selectedModel === 'mixtral-8x7b-32768' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Mixtral 8x7B</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onModelChange('gemma2-9b-it')}
          className={`px-1.5 py-1 ${selectedModel === 'gemma2-9b-it' ? 'bg-accent' : ''}`}
        >
          <span className="text-xs">Gemma 9B</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
