import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AgentThought {
  type: 'thought';
  content: string;
  timestamp: number;
}

export interface AgentAction {
  type: 'action';
  tool: string;
  arguments: Record<string, any>;
  timestamp: number;
}

export interface AgentObservation {
  type: 'observation';
  result: any;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface AgentStep {
  stepNumber: number;
  thought?: AgentThought;
  action?: AgentAction;
  observation?: AgentObservation;
  isComplete: boolean;
}

export interface AgentState {
  steps: AgentStep[];
  isRunning: boolean;
  isComplete: boolean;
  finalAnswer?: string;
  errorMessage?: string;
}

export type AgentStepCallback = (step: AgentStep) => void;
export type AgentCompleteCallback = (finalAnswer: string) => void;
export type AgentErrorCallback = (error: string) => void;

// ============================================================================
// CALENDAR AGENT CLASS
// ============================================================================

export class CalendarAgent {
  private groq: Groq;
  private model: string;
  private maxSteps: number;
  private tools: ChatCompletionTool[];
  private toolHandlers: Map<string, (args: any) => Promise<any>>;
  
  // Callbacks
  private onStepUpdate?: AgentStepCallback;
  private onComplete?: AgentCompleteCallback;
  private onError?: AgentErrorCallback;

  constructor(
    apiKey: string,
    model: string = 'openai/gpt-oss-120b',
    maxSteps: number = 10
  ) {
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    this.model = model;
    this.maxSteps = maxSteps;
    this.tools = [];
    this.toolHandlers = new Map();
  }

  // Register a tool with its handler
  registerTool(tool: ChatCompletionTool, handler: (args: any) => Promise<any>) {
    this.tools.push(tool);
    if (tool.function?.name) {
      this.toolHandlers.set(tool.function.name, handler);
    }
  }

  // Set callbacks for streaming updates
  setCallbacks(
    onStepUpdate?: AgentStepCallback,
    onComplete?: AgentCompleteCallback,
    onError?: AgentErrorCallback
  ) {
    this.onStepUpdate = onStepUpdate;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  // Main agent loop - ReAct pattern (Reason → Act → Observe)
  async run(
    userMessage: string,
    conversationHistory: ChatCompletionMessageParam[] = []
  ): Promise<AgentState> {
    const state: AgentState = {
      steps: [],
      isRunning: true,
      isComplete: false,
    };

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: this.getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    try {
      for (let stepNum = 1; stepNum <= this.maxSteps; stepNum++) {
        const currentStep: AgentStep = {
          stepNumber: stepNum,
          isComplete: false,
        };

        // THINK: Get AI's reasoning and potential action
        const completion = await this.groq.chat.completions.create({
          model: this.model,
          messages,
          tools: this.tools,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 4096,
        });

        const response = completion.choices[0]?.message;
        if (!response) {
          throw new Error('No response from AI');
        }

        // Extract thought from the response
        if (response.content) {
          currentStep.thought = {
            type: 'thought',
            content: response.content,
            timestamp: Date.now(),
          };
          this.onStepUpdate?.(currentStep);
        }

        // Check if AI wants to take an action
        if (response.tool_calls && response.tool_calls.length > 0) {
          const toolCall = response.tool_calls[0];
          
          // ACT: Record the action
          currentStep.action = {
            type: 'action',
            tool: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments),
            timestamp: Date.now(),
          };
          this.onStepUpdate?.(currentStep);

          // OBSERVE: Execute the tool and get result
          try {
            const handler = this.toolHandlers.get(toolCall.function.name);
            if (!handler) {
              throw new Error(`No handler found for tool: ${toolCall.function.name}`);
            }

            const result = await handler(JSON.parse(toolCall.function.arguments));
            
            currentStep.observation = {
              type: 'observation',
              result,
              success: true,
              timestamp: Date.now(),
            };
            currentStep.isComplete = true;
            this.onStepUpdate?.(currentStep);

            // Add to state
            state.steps.push(currentStep);

            // Add assistant message and tool result to conversation
            messages.push(response);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });

          } catch (error: any) {
            currentStep.observation = {
              type: 'observation',
              result: null,
              success: false,
              error: error.message,
              timestamp: Date.now(),
            };
            currentStep.isComplete = true;
            this.onStepUpdate?.(currentStep);
            state.steps.push(currentStep);

            // Add error to conversation
            messages.push(response);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: error.message }),
            });
          }

        } else {
          // No tool call - AI has provided final answer
          currentStep.isComplete = true;
          this.onStepUpdate?.(currentStep);
          state.steps.push(currentStep);
          
          messages.push(response);

          state.finalAnswer = response.content || '';
          state.isComplete = true;
          state.isRunning = false;
          
          if (state.finalAnswer) {
            this.onComplete?.(state.finalAnswer);
          }
          return state;
        }
      }

      // Max steps reached without conclusion
      state.errorMessage = `Maximum steps (${this.maxSteps}) reached without completing the task.`;
      state.isComplete = true;
      state.isRunning = false;
      this.onError?.(state.errorMessage);

    } catch (error: any) {
      state.errorMessage = error.message;
      state.isComplete = true;
      state.isRunning = false;
      this.onError?.(error.message);
    }

    return state;
  }

  // Minimal, focused system prompt for agent behavior
  private getSystemPrompt(): string {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    
    // Calculate next occurrence of each weekday
    const dayNames = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const weekdayDates: { [key: string]: string } = {};
    
    for (let i = 0; i < 7; i++) {
      const daysAhead = i === currentDay ? 7 : (i - currentDay + 7) % 7; // Next occurrence
      const targetDate = new Date(now.getTime() + daysAhead * 86400000);
      weekdayDates[dayNames[i]] = targetDate.toISOString().split('T')[0];
    }
    
    return `You are a Calendar Assistant Agent powered by DeepSeek V3. Your job is to help users manage their calendar events through a conversational interface.

## CORE PRINCIPLES

1. **Act, Don't Ask**: Minimize questions - take action based on context (az soru, çok iş)
2. **Multi-Step Execution**: Chain operations autonomously without asking permission
3. **Verify Before Deleting**: Query first, then delete/update
4. **Professional Brevity**: Short, direct responses - no fluff

## AVAILABLE TOOLS

You have access to the following calendar operations:

- **query_events**: Search and filter events
- **create_event**: Add new events to the calendar
- **update_event**: Modify existing events
- **delete_event**: Remove individual events
- **bulk_update_events**: Update multiple events at once
- **bulk_delete_events**: Delete multiple events at once

**CRITICAL**: When calling tools, **NEVER send null values** for optional parameters. If user doesn't provide a value, **omit the parameter entirely** from your function call.

Example WRONG: create_event with location: null, category: null
Example CORRECT: create_event with only required fields (title, start, end)

## WORKFLOW PATTERNS

### Pattern 1: Query-First Approach
When users ask about events or want to modify them:
1. Use query_events to find relevant events
2. Present findings to user
3. If modification needed, use appropriate update/delete tool

Example: "yarın matematik sil"
- Step 1: query_events(searchTerm: "matematik", startDate: tomorrow)
- Step 2: Review results
- Step 3: delete_event(id: found_event_id) or ask for confirmation

### Pattern 2: Direct Creation
When users clearly want to create a new event:
1. Extract all details (title, date, time, participants, etc.)
2. If missing critical info, ask user
3. Create event with create_event tool

Example: "yarın saat 14:00'te Ahmet ile toplantı ekle"
- Step 1: create_event(title: "Ahmet ile toplantı", startDate: tomorrow 14:00)

### Pattern 3: Bulk Operations
When operating on multiple events:
1. Use query_events to find all matching events
2. Confirm count and details with user
3. Use bulk_update_events or bulk_delete_events

## DATE & TIME HANDLING

**CRITICAL: Use these EXACT dates - do NOT calculate yourself:**

- **Today (bugün)**: ${today}
- **Tomorrow (yarın)**: ${tomorrow}
- **Pazar (Sunday)**: ${weekdayDates['pazar']}
- **Pazartesi (Monday)**: ${weekdayDates['pazartesi']}
- **Salı (Tuesday)**: ${weekdayDates['salı']}
- **Çarşamba (Wednesday)**: ${weekdayDates['çarşamba']}
- **Perşembe (Thursday)**: ${weekdayDates['perşembe']}
- **Cuma (Friday)**: ${weekdayDates['cuma']}
- **Cumartesi (Saturday)**: ${weekdayDates['cumartesi']}

**IMPORTANT**: Always use ISO 8601 format (YYYY-MM-DD) for dates in tool calls.

## RESPONSE GUIDELINES

1. **Be Professional**: Speak concisely and directly - like a competent assistant
2. **Be Action-Oriented**: Less questions, more doing - agent mode (az soru, çok iş)
3. **Be Brief**: Short, clear responses - no unnecessary words
4. **No Emojis**: NEVER use emojis - keep it professional and clean
5. **Personal Touch**: Occasionally address user by name (Aral) when appropriate
6. **Tone**: Slightly formal, efficient, competent - not overly friendly

## EXAMPLE SCENARIOS

**User**: "perşembe toplantım var mı?"
**Action**: query_events(startDate: "${weekdayDates['perşembe']}", endDate: "${weekdayDates['perşembe']}", searchTerm: "toplantı")
**Observation**: Found 1 event: "Proje Toplantısı" at 15:00
**Response**: "Perşembe 15:00'te Proje Toplantısı var."

**User**: "yarın saat 14'te doktor randevusu ekle"
**Action**: create_event(title: "Doktor randevusu", start: "${tomorrow}T14:00:00", end: "${tomorrow}T15:00:00")
**Response**: "Eklendi."

**User**: "cumartesi etkinliklerini cumaya taşı"
**Action 1**: query_events(startDate: "${weekdayDates['cumartesi']}", endDate: "${weekdayDates['cumartesi']}")
**Observation**: Found 2 events
**Action 2**: bulk_update_events(eventIds: [...], updates: {start: "...", end: "..."})
**Response**: "2 etkinlik cumaya taşındı."

**User**: "matematik derslerini sil"
**Action 1**: query_events(searchTerm: "matematik")
**Observation**: Found 3 events
**Action 2**: bulk_delete_events(eventIds: [id1, id2, id3])
**Response**: "3 matematik dersi silindi."

## IMPORTANT RULES

- **No null values**: Omit optional parameters if not provided by user
- **Verify before bulk operations**: Always query first
- **Brief responses**: 1-2 sentences maximum unless explaining complex results
- **No fabrication**: Only use real data from tools
- **Agent autonomy**: Execute multi-step operations without asking permission for each step

You are an autonomous agent - think step by step, use tools as needed, and provide excellent user experience.`;
  }
}
