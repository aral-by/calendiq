import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

export type AIModel = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleModelChange = (model: AIModel) => {
    setIsAnimating(true);
    onModelChange(model);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 backdrop-blur-sm border-b border-border">
      {/* Groq Logo with Animation */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full blur-lg opacity-50 ${isAnimating ? 'animate-pulse' : ''}`} />
        <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className={`w-5 h-5 text-white ${isAnimating ? 'animate-spin' : ''}`} />
        </div>
      </div>

      {/* Model Selector */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">AI Model</span>
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            <button
              onClick={() => handleModelChange('llama-3.3-70b-versatile')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedModel === 'llama-3.3-70b-versatile'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>70B Pro</span>
              </div>
            </button>
            <button
              onClick={() => handleModelChange('llama-3.1-8b-instant')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedModel === 'llama-3.1-8b-instant'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                <span>8B Fast</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Model Info */}
        <div className="mt-1 text-xs text-muted-foreground">
          {selectedModel === 'llama-3.3-70b-versatile' ? (
            <span>Daha akıllı • 100K token/gün</span>
          ) : (
            <span>Daha hızlı • 1M token/gün</span>
          )}
        </div>
      </div>

      {/* Powered by Groq */}
      <div className="text-right">
        <div className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Powered by
        </div>
        <div className="text-sm font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
          Groq AI
        </div>
      </div>
    </div>
  );
}
