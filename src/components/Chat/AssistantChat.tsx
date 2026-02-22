import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, ArrowUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useChatHistory, ChatMessage } from '@/context/ChatHistoryContext';
import { useEvents } from '@/context/EventContext';
import { AIActionSchema, isCreateEventAction, isUpdateEventAction, isDeleteEventAction, isQueryEventsAction } from '@/types/ai';
import { ActionCard } from '@/components/Chat/ActionCard';
import { CalendarEvent } from '@/types/event';

function getTimeBasedGreeting(userName?: string): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  
  // Casual greetings (not time-specific) - expanded variety with better name integration
  const casualGreetings = [
    { title: "What's cooking", subtitle: 'Ready to organize your day?', withName: true },
    { title: 'Hey there', subtitle: 'How can I assist you today?', withName: true },
    { title: 'Welcome back', subtitle: "Let's get things done", withName: true },
    { title: 'Look who it is', subtitle: 'Ready to get productive?', withName: false },
    { title: 'Ready to roll', subtitle: 'Ready to schedule something?', withName: true },
    { title: 'Howdy partner', subtitle: "Let's make magic happen", withName: false },
    { title: "What's the plan", subtitle: 'Time to plan something awesome', withName: true },
    { title: 'Well well well', subtitle: "What's on your agenda today?", withName: false },
    { title: 'Back for more', subtitle: 'Ready to tackle your schedule?', withName: true },
    { title: 'Good to see you', subtitle: "Let's organize your world", withName: true },
    { title: 'There you are', subtitle: 'Nice to see you here', withName: true },
    { title: 'Welcome', subtitle: "Let's plan something great", withName: true },
    { title: 'Hey friend', subtitle: 'Your calendar awaits', withName: false },
    { title: "What's happening", subtitle: 'How can I help you today?', withName: true },
    { title: 'Ahoy', subtitle: 'Time to organize things?', withName: true },
    { title: 'Cheers', subtitle: 'Ready to navigate your schedule?', withName: true },
    { title: "What's new", subtitle: "What's the plan today?", withName: true },
    { title: 'Long time no see', subtitle: "Let's get productive", withName: true },
    { title: 'Nice to see you', subtitle: 'Ready for action?', withName: true },
    { title: "How's it going", subtitle: 'Time to organize?', withName: true },
  ];
  
  const timeBasedGreetings = {
    earlyMorning: [
      { title: 'Hello Early Bird', subtitle: 'The world is yours to conquer' },
      { title: 'Rise and Shine', subtitle: 'A new day awaits you' },
      { title: 'Morning Warrior', subtitle: 'Ready to seize the day?' },
      { title: 'Bright and Early', subtitle: 'Love the enthusiasm!' },
      { title: 'Wakey Wakey', subtitle: "Let's make today amazing" },
      { title: 'Up with the Sun', subtitle: 'Your dedication is inspiring' },
      { title: 'Early Riser', subtitle: 'The best hours are ahead' },
    ],
    morning: [
      { title: 'Good Morning', subtitle: "Let's make today productive" },
      { title: 'Morning Sunshine', subtitle: 'How can I brighten your day?' },
      { title: 'Fresh Start', subtitle: 'What shall we accomplish today?' },
      { title: 'Top of the Morning', subtitle: 'Ready to own the day?' },
      { title: 'Morning Glory', subtitle: 'Your day awaits' },
      { title: 'Beautiful Morning', subtitle: "Let's make it count" },
      { title: 'Morning Champion', subtitle: 'Ready for greatness?' },
      { title: 'Rise Up', subtitle: "Time to shine" },
    ],
    afternoon: [
      { title: 'Good Afternoon', subtitle: "How's your day going?" },
      { title: 'Midday Maestro', subtitle: 'Keep up the great momentum' },
      { title: 'Afternoon Achiever', subtitle: 'Ready to tackle more tasks?' },
      { title: 'Afternoon Delight', subtitle: "Let's boost that productivity" },
      { title: 'Halfway There', subtitle: 'Keep the energy flowing' },
      { title: 'Afternoon Star', subtitle: 'Shining bright today?' },
      { title: 'Pleasant Afternoon', subtitle: "What's next on your list?" },
      { title: 'Midday Break', subtitle: 'Time to plan ahead?' },
    ],
    evening: [
      { title: 'Good Evening', subtitle: 'Winding down or gearing up?' },
      { title: 'Evening Star', subtitle: 'How can I help you tonight?' },
      { title: 'Sunset Scheduler', subtitle: "Let's plan ahead together" },
      { title: 'Evening Planner', subtitle: 'Preparing for tomorrow?' },
      { title: 'Twilight Time', subtitle: "What's on your mind?" },
      { title: 'Golden Hour', subtitle: 'Perfect time to organize' },
      { title: 'Evening Edition', subtitle: 'Ready to wrap things up?' },
      { title: 'After Hours', subtitle: 'Still going strong?' },
    ],
    night: [
      { title: 'Hello Night Owl', subtitle: 'Burning the midnight oil?' },
      { title: 'Late Night Planner', subtitle: 'What brings you here at this hour?' },
      { title: 'Midnight Maestro', subtitle: "Night time, bright ideas" },
      { title: 'Burning the Midnight Oil', subtitle: 'Dedication at its finest' },
      { title: 'Night Shift', subtitle: 'When do you sleep?' },
      { title: 'Moonlight Scheduler', subtitle: 'Planning under the stars?' },
      { title: 'Insomniac Achiever', subtitle: "Can't stop, won't stop" },
      { title: 'After Midnight', subtitle: 'Your dedication is admirable' },
      { title: 'Night Mode Activated', subtitle: 'Best ideas come at night?' },
      { title: 'Nocturnal Navigator', subtitle: 'The night is young' },
    ],
  };

  // 50% chance for time-based, 50% chance for casual
  const useCasual = Math.random() > 0.5;
  
  let greeting;
  if (useCasual) {
    const randomCasual = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
    greeting = randomCasual;
    
    // Add name if it should be included
    if (userName && randomCasual.withName) {
      greeting = {
        ...randomCasual,
        title: `${randomCasual.title}, ${userName}`,
      };
    }
  } else {
    let timeGreetings;
    if (hour >= 5 && hour < 8) timeGreetings = timeBasedGreetings.earlyMorning;
    else if (hour >= 8 && hour < 12) timeGreetings = timeBasedGreetings.morning;
    else if (hour >= 12 && hour < 17) timeGreetings = timeBasedGreetings.afternoon;
    else if (hour >= 17 && hour < 21) timeGreetings = timeBasedGreetings.evening;
    else timeGreetings = timeBasedGreetings.night;
    
    greeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    
    if (userName) {
      greeting = {
        ...greeting,
        title: `${greeting.title}, ${userName}`,
      };
    }
  }
  
  return greeting;
}

export function AssistantChat() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { currentSession, currentSessionId, createNewSession, switchSession, addMessage } = useChatHistory();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  
  const userName = user?.firstName;
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  const messages = currentSession?.messages || [];

  // Helper: Check for event conflicts
  const checkEventConflicts = (newEvent: { start: string; end: string; allDay?: boolean }): CalendarEvent[] => {
    const newStart = new Date(newEvent.start);
    const newEnd = new Date(newEvent.end);
    
    return events.filter(existingEvent => {
      if (newEvent.allDay || existingEvent.allDay) return false; // Skip all-day events
      
      const existingStart = new Date(existingEvent.start);
      const existingEnd = new Date(existingEvent.end);
      
      // Check if events overlap
      return (
        (newStart >= existingStart && newStart < existingEnd) || // New starts during existing
        (newEnd > existingStart && newEnd <= existingEnd) ||     // New ends during existing
        (newStart <= existingStart && newEnd >= existingEnd)     // New encompasses existing
      );
    });
  };

  const examplePrompts = [
    "Yarın saat 15'te doktor randevum var",
    "Pazartesi 10'da toplantı ekle",
    "Bu haftaki etkinliklerimi göster",
  ];

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Create a new session if none exists (first message)
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
      switchSession(sessionId);
    }
    
    const userMessage = message.trim();
    
    // Add user message to chat
    addMessage({ role: 'user', content: userMessage, timestamp: Date.now() }, sessionId);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Check if online
      if (!navigator.onLine) {
        addMessage({ 
          role: 'assistant', 
          content: 'Çevrimdışısın. AI özellikleri için internet bağlantısı gerekiyor. Manuel olarak etkinlik ekleyebilirsin.',
          timestamp: Date.now()
        }, sessionId);
        setIsLoading(false);
        return;
      }

      // Prepare messages for API
      const apiMessages = messages
        .concat([{ role: 'user', content: userMessage, timestamp: Date.now() }])
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Send to AI endpoint with current events context
      // Development: Direct call to Groq (API key from .env)
      // Production: Will use /api/ai serverless function
      const isDevelopment = import.meta.env.DEV;
      const USE_MOCK_FOR_DEV = false; // Groq API aktif!
      
      let data;
      
      if (isDevelopment && USE_MOCK_FOR_DEV) {
        // Mock mode for development (когда API key invalid)
        console.log('[AssistantChat] Dev mode: Using MOCK (API key not configured)');
        data = {
          message: 'Anladım! (Mock mode - gerçek AI yok)',
          action: {
            type: 'CREATE_EVENT',
            payload: {
              title: userMessage,
              start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
              allDay: false,
              category: 'personal',
              reminder: 15,
            }
          }
        };
      } else if (isDevelopment) {
        // Direct Groq call for development
        console.log('[AssistantChat] Dev mode: Calling Groq directly');
        
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        
        if (!apiKey) {
          throw new Error('VITE_GROQ_API_KEY not found in .env file');
        }
        
        // Türkiye timezone'u (UTC+3)
        const turkeyNow = new Date();
        const turkeyTime = new Date(turkeyNow.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
        
        const systemMessage = {
          role: 'system',
          content: `You are Oscar, a helpful calendar assistant for Calendiq. You help users manage their calendar in Turkish.

Current date/time (Turkey UTC+3): ${turkeyTime.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'long' })}
ISO: ${turkeyTime.toISOString()}

You can:
- Create new events (use create_event function)
- Update existing events (use update_event function with event ID)
- Delete events (use delete_event function with event ID)
- Query/search events (use query_events function)
- Have friendly conversations
- Ask follow-up questions if information is missing (DON'T use any function, just respond normally)

${events.length > 0 ? `Current user events:\n${events.map((e) => `- ${e.title} (${e.start}) [ID: ${e.id}]`).join('\n')}` : 'User has no events yet.'}

IMPORTANT: 
- ALWAYS respond in Turkish
- If user doesn't specify time, ASK "Saat kaçta?" before creating event
- If user doesn't specify date, ASK "Hangi gün?" before creating event
- If information is incomplete, ask ONE clarifying question at a time
- When you have all info, THEN use create_event function
- When user asks about their events, use query_events to search
- When updating/deleting, first query to find the event ID if needed
- Be friendly and helpful
- Auto-categorize events: work, personal, health, social, finance, education
- Default reminder: 15 minutes before
- Use Turkey timezone (UTC+3) for all date/time calculations`,
        };

        const tools = [
          {
            type: 'function',
            function: {
              name: 'create_event',
              description: 'Create a new calendar event',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  start: { type: 'string', description: 'ISO 8601 format' },
                  end: { type: 'string', description: 'ISO 8601 format' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  allDay: { type: 'boolean' },
                  category: { type: 'string', enum: ['work', 'personal', 'health', 'social', 'finance', 'education'] },
                  reminder: { type: 'number' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                },
                required: ['title', 'start', 'end'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'query_events',
              description: 'Query/search calendar events',
              parameters: {
                type: 'object',
                properties: {
                  startDate: { type: 'string' },
                  endDate: { type: 'string' },
                  category: { type: 'string' },
                  searchTerm: { type: 'string' },
                },
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'update_event',
              description: 'Update an existing event',
              parameters: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  updates: { type: 'object' },
                },
                required: ['id', 'updates'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'delete_event',
              description: 'Delete a calendar event',
              parameters: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                required: ['id'],
              },
            },
          },
        ];

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', // Groq's latest model with tool calling support
            messages: [systemMessage, ...apiMessages],
            tools,
            tool_choice: 'auto',
          }),
        });

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          console.error('[AssistantChat] Groq error:', groqResponse.status, errorText);
          throw new Error(`Groq error: ${groqResponse.status} - ${errorText}`);
        }

        const openrouterData = await groqResponse.json();
        const assistantMessage = openrouterData.choices[0]?.message;
        
        if (!assistantMessage) {
          throw new Error('No assistant message in response');
        }

        const toolCalls = assistantMessage.tool_calls;
        let action;

        if (toolCalls && toolCalls.length > 0) {
          const toolCall = toolCalls[0];
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          switch (functionName) {
            case 'create_event':
              action = { type: 'CREATE_EVENT', payload: functionArgs };
              break;
            case 'update_event':
              action = { type: 'UPDATE_EVENT', id: functionArgs.id, payload: functionArgs.updates };
              break;
            case 'delete_event':
              action = { type: 'DELETE_EVENT', id: functionArgs.id };
              break;
            case 'query_events':
              action = { type: 'QUERY_EVENTS', filter: functionArgs };
              break;
            default:
              action = { type: 'NO_ACTION', message: assistantMessage.content || 'Anladım!' };
          }
        } else {
          action = { type: 'NO_ACTION', message: assistantMessage.content || 'Anladım!' };
        }

        data = {
          message: assistantMessage.content || 'İşlem yapılıyor...',
          action,
        };
      } else {
        // Production: Use serverless function
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: apiMessages,
            events: events.map(e => ({
              id: e.id,
              title: e.title,
              start: e.start,
              end: e.end,
              category: e.category,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        data = await response.json();
      }
      
      console.log('[AssistantChat] API response:', data);

      // Validate AI action
      let aiResponseText = data.message || 'Anladım!';
      let actionMetadata: ChatMessage['action'] = undefined;

      if (data.action) {
        try {
          const validatedAction = AIActionSchema.parse(data.action);
          console.log('[AssistantChat] Validated action:', validatedAction);

          // Execute action
          if (isCreateEventAction(validatedAction)) {
            console.log('[AssistantChat] Creating event:', validatedAction.payload);
            const eventData = {
              ...validatedAction.payload,
              allDay: validatedAction.payload.allDay ?? false,
            };
            
            // Check for conflicts
            const conflicts = checkEventConflicts(eventData);
            
            if (conflicts.length > 0) {
              // Show conflict warning but still create the event
              actionMetadata = {
                type: 'conflict',
                event: eventData,
                conflictingEvents: conflicts,
              };
              await createEvent(eventData);
            } else {
              // No conflicts, create successfully
              await createEvent(eventData);
              actionMetadata = {
                type: 'created',
                event: eventData,
              };
            }
          } else if (isUpdateEventAction(validatedAction)) {
            console.log('[AssistantChat] Updating event:', validatedAction.id, validatedAction.payload);
            await updateEvent(validatedAction.id, validatedAction.payload);
            const updatedEvent = events.find(e => e.id === validatedAction.id);
            actionMetadata = {
              type: 'updated',
              event: updatedEvent ? { ...updatedEvent, ...validatedAction.payload } : validatedAction.payload,
            };
          } else if (isDeleteEventAction(validatedAction)) {
            console.log('[AssistantChat] Deleting event:', validatedAction.id);
            const deletedEvent = events.find(e => e.id === validatedAction.id);
            await deleteEvent(validatedAction.id);
            actionMetadata = {
              type: 'deleted',
              event: deletedEvent,
            };
          } else if (isQueryEventsAction(validatedAction)) {
            console.log('[AssistantChat] Querying events:', validatedAction.filter);
            // Query events are shown in text, not as action card
            // Just keep the AI's text response
          }
        } catch (validationError) {
          console.error('[AssistantChat] Action validation error:', validationError);
        }
      }

      // Add AI response to chat with action metadata
      addMessage({ 
        role: 'assistant', 
        content: aiResponseText,
        timestamp: Date.now(),
        action: actionMetadata,
      }, sessionId);
      
    } catch (error) {
      console.error('[AssistantChat] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      addMessage({ 
        role: 'assistant', 
        content: `⚠️ Hata oluştu: ${errorMessage}\n\nLütfen tekrar dene veya manuel olarak etkinlik ekle.`,
        timestamp: Date.now()
      }, sessionId);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input (Phase 6 - Deepgram integration)
    console.log('Voice input will be implemented in Phase 6');
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">{greeting.title}</h1>
              <p className="text-xl text-muted-foreground">{greeting.subtitle}</p>
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
        ) : (
          // Chat Messages
          <div className="flex-1 w-full overflow-y-auto space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {msg.role === 'user' ? (
                  // User message - no bubble, just text
                  <p className="text-lg max-w-[80%]">{msg.content}</p>
                ) : (
                  // AI message - with bubble and optional action card
                  <>
                    <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-muted">
                      <p className="text-lg text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.action && (
                      <div className="w-full max-w-[80%]">
                        <ActionCard 
                          type={msg.action.type} 
                          event={msg.action.event}
                          conflictingEvents={msg.action.conflictingEvents}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="w-full pb-4">
          <div className="relative flex items-center gap-3 rounded-3xl border border-border bg-background p-4 shadow-lg">
            <Button
              onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
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
              disabled={!message.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
