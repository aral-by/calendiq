import { useState } from 'react';
import { Brain, Zap, Eye, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="space-y-3 my-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Brain className="h-4 w-4" />
        <span className="font-medium">Agent Thinking Process</span>
        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs">Processing...</span>
          </div>
        )}
      </div>

      {/* Steps Timeline */}
      <div className="relative space-y-3 pl-6">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-orange-500 to-green-500 opacity-30" />

        {steps.map((step) => (
          <div key={step.stepNumber} className="relative">
            {/* Step Container */}
            <Card className="border-l-4 border-l-blue-500/50 shadow-sm hover:shadow-md transition-all duration-200">
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.stepNumber)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
              >
                {/* Step Number Badge */}
                <div className="absolute -left-[34px] top-3 h-6 w-6 rounded-full bg-background border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-500 shadow-sm">
                  {step.stepNumber}
                </div>

                {/* Expand/Collapse Icon */}
                {expandedSteps.has(step.stepNumber) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}

                {/* Step Summary */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {step.thought && <Badge variant="outline" className="text-blue-600 border-blue-600">Thought</Badge>}
                    {step.action && <Badge variant="outline" className="text-orange-600 border-orange-600">Action</Badge>}
                    {step.observation && (
                      <Badge 
                        variant="outline" 
                        className={step.observation.success ? "text-green-600 border-green-600" : "text-red-600 border-red-600"}
                      >
                        {step.observation.success ? 'Success' : 'Error'}
                      </Badge>
                    )}
                  </div>
                  {step.action && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {step.action.tool}
                    </p>
                  )}
                </div>

                {/* Completion Indicator */}
                {step.isComplete && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </button>

              {/* Expanded Step Details */}
              {expandedSteps.has(step.stepNumber) && (
                <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  {/* Thought Section */}
                  {step.thought && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        <Brain className="h-4 w-4" />
                        <span>Reasoning</span>
                      </div>
                      <div className="pl-6 text-sm text-foreground/90 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        {step.thought.content}
                      </div>
                    </div>
                  )}

                  {/* Action Section */}
                  {step.action && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                        <Zap className="h-4 w-4" />
                        <span>Action: {step.action.tool}</span>
                      </div>
                      <div className="pl-6">
                        <pre className="text-xs bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800 overflow-x-auto">
                          {JSON.stringify(step.action.arguments, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Observation Section */}
                  {step.observation && (
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-sm font-medium ${step.observation.success ? 'text-green-600' : 'text-red-600'}`}>
                        {step.observation.success ? (
                          <><Eye className="h-4 w-4" /><span>Result</span></>
                        ) : (
                          <><XCircle className="h-4 w-4" /><span>Error</span></>
                        )}
                      </div>
                      <div className="pl-6">
                        {step.observation.error ? (
                          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                            {step.observation.error}
                          </div>
                        ) : (
                          <pre className="text-xs bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800 overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(step.observation.result, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  {(step.thought || step.action || step.observation) && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      {step.observation?.timestamp && (
                        <span>Completed at {new Date(step.observation.timestamp).toLocaleTimeString()}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        ))}

        {/* Loading indicator for current step */}
        {isRunning && (
          <div className="relative">
            <Card className="border-l-4 border-l-blue-500/50 shadow-sm">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="absolute -left-[34px] top-3 h-6 w-6 rounded-full bg-background border-2 border-blue-500 flex items-center justify-center shadow-sm">
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
