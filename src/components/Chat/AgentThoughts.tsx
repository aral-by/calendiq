import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AgentStep } from '@/lib/agent';

interface AgentThoughtsProps {
  steps: AgentStep[];
  isRunning: boolean;
}

export function AgentThoughts({ steps, isRunning }: AgentThoughtsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  if (steps.length === 0 && !isRunning) return null;

  return (
    <div className="space-y-2 my-3">
      <div className="text-xs text-muted-foreground mb-2">
        Agent process {isRunning && '(running...)'}
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <Card key={step.stepNumber} className="overflow-hidden">
            <button
              onClick={() => toggleStep(step.stepNumber)}
              className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-accent/50 transition-colors"
            >
              {expandedSteps.has(step.stepNumber) ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}

              <span className="text-xs font-medium text-muted-foreground">Step {step.stepNumber}</span>
              
              {step.action && (
                <span className="text-xs text-foreground ml-auto truncate">
                  {step.action.tool}
                </span>
              )}
            </button>

            {expandedSteps.has(step.stepNumber) && (
              <CardContent className="px-3 pb-3 pt-0 space-y-2 text-xs">
                {step.thought && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Thinking:</div>
                    <div className="pl-2 border-l-2 border-border">
                      {step.thought.content}
                    </div>
                  </div>
                )}

                {step.action && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Action:</div>
                    <pre className="pl-2 border-l-2 border-border text-xs overflow-x-auto">
{JSON.stringify(step.action.arguments, null, 2)}
                    </pre>
                  </div>
                )}

                {step.observation && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground">
                      {step.observation.success ? 'Result:' : 'Error:'}
                    </div>
                    <pre className="pl-2 border-l-2 border-border text-xs overflow-x-auto max-h-48 overflow-y-auto">
{step.observation.error || JSON.stringify(step.observation.result, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {isRunning && (
          <Card>
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-pulse" />
              <span className="text-xs text-muted-foreground">Processing...</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
