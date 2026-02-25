import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, ArrowUp, Calendar, Clock, MapPin } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useChatHistory, ChatMessage } from '@/context/ChatHistoryContext';
import { useEvents } from '@/context/EventContext';
import { AIActionSchema, isCreateEventAction, isUpdateEventAction, isDeleteEventAction, isBulkUpdateEventsAction, isBulkDeleteEventsAction, isQueryEventsAction } from '@/types/ai';
import { ActionCard } from '@/components/Chat/ActionCard';
import { CalendarEvent } from '@/types/event';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ModelSelector, AIModel } from '@/components/Chat/ModelSelector';
import { useSidebar } from '@/components/ui/sidebar';

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
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    // Load from localStorage or default to DeepSeek V3
    const saved = localStorage.getItem('preferredAIModel');
    return (saved as AIModel) || 'openai/gpt-oss-120b';
  });
  
  const { user } = useUser();
  const { currentSession, currentSessionId, createNewSession, switchSession, addMessage } = useChatHistory();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const { state: sidebarState } = useSidebar();
  
  const userName = user?.firstName;
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);
  
  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferredAIModel', selectedModel);
  }, [selectedModel]);

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
  "I have a doctor appointment tomorrow at 3pm",
  "This week looks intense, can you balance it?",
  "Schedule a 2-hour deep work block",
  "Keep my mornings distraction-free",
  "Do I have space for a quick meeting on Thursday?",
  "Show me everything I planned for this week",
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
        
        // Get current Turkey time (browser timezone)
        const now = new Date();
        const turkeyTime = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'long' });
        const isoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })).toISOString();
        
        const systemMessage = {
          role: 'system',
          content: `You are Oscar, the friendly and witty calendar assistant for Calendiq. You help Turkish users manage their schedules with personality and humor.

🗓️ Current date/time (Turkey UTC+3): ${turkeyTime}
ISO: ${isoTime}

${events.length > 0 ? `📅 User's current events:\n${events.map((e) => `  • ${e.title} - ${e.start} [ID: ${e.id}]`).join('\n')}` : '📭 User has no events yet.'}

🎯 PERSONALITY & TONE:
- Speak naturally in Turkish, like a helpful friend
- Be warm, professional, and clear
- NO emojis - keep responses clean and text-only
- Show personality through words, not symbols! Examples:
  ✓ "Tamam, hadi ekleyelim!"
  ✓ "Harika! İşte bu kadar!"
  ✓ "Anladım! Hemen halledelim."
  ✗ "Etkinlik başarıyla oluşturuldu." (too robotic)
  ✗ "Harika! 🎉" (NO emojis)

📝 GATHERING INFORMATION (CRITICAL - Follow this order):
When user wants to create an event, ask in THIS ORDER:
1️⃣ FIRST: What is the event? (title/description)
   Example: "Ne eklememi istersin? Toplantı mı, randevu mu, başka bir şey mi?"
   
2️⃣ SECOND: When is it? (date if not specified)
   Example: "Tamamdır! Hangi gün?"
   
3️⃣ THIRD: What time? (time if not specified)
   Example: "Saat kaçta olacak?"
   
4️⃣ FOURTH (optional): Location? (only if relevant)
   Example: "Nerede gerçekleşecek? (İsteğe bağlı)"

❗ IMPORTANT RULES:
- Ask ONE question at a time
- Wait for user response before asking next question
- DON'T use any function until you have: title + date + time
- When you have all required info, THEN use create_event function

🚫 WHEN NOT TO USE FUNCTIONS (CRITICAL):
- Greetings: "merhaba", "selam", "günaydın", "iyi geceler" → Just respond warmly, NO function
- Thank you: "teşekkürler", "sağol", "eyvallah" → Just say you're welcome, NO function
- Casual chat: "nasılsın", "ne var ne yok", "naber" → Just chat, NO function
- Acknowledgments: "tamam", "anladım", "olur" → Just acknowledge, NO function
- Farewells: "görüşürüz", "hoşça kal", "bay bay" → Just say goodbye, NO function
- ONLY use functions when user explicitly asks to: create, add, schedule, update, delete, or query events
- If unsure, just respond conversationally - it's better than calling wrong function!

- For queries, ALWAYS use query_events function - NEVER list events manually in text
- When user asks "bugünün programı", "yarın ne var", "etkinliklerim", etc., CALL query_events function
- ⚠️ CRITICAL: Questions with "var mı?" ("is there?") are QUERIES - use query_events!
  * "perşembe gününde toplantım var mı?" → query_events for Thursday + searchTerm="toplantı"
  * "yarın etkinliğim var mı?" → query_events for tomorrow
  * "bugün ne var?" → query_events for today
- For updates/deletes, use update_event or delete_event
- For BULK operations (multiple events):
  * First, call query_events to get matching events
  * Then use bulk_update_events or bulk_delete_events with the event IDs
  * Examples: "sabah etkinliklerini öğleden sonraya al" → query morning events, then bulk_update
  * "cuma gününü iptal et" → query Friday events, then bulk_delete
- ALWAYS respond in Turkish
- Use Turkey timezone (UTC+3) for all calculations
- NEVER send empty strings in function parameters - omit optional parameters instead
- If user asks about results just shown (e.g., "detayları var mı?"), DON'T call functions - just answer from context
- Events already displayed have all details - user can see them on screen
- ⚠️ CRITICAL: NEVER write <function=...> or any XML-like tags in your response text
- ⚠️ ALWAYS use tool_calls feature - NEVER write function calls as plain text
- Just respond naturally in Turkish - the system will handle function calls automatically

🏷️ AUTO-CATEGORIZATION:
Automatically detect category from context:
- work: toplantı, iş, sunum, proje, müşteri, ofis
- personal: alışveriş, kişisel, ev, aile
- health: doktor, randevu, spor, sağlık, diş, check-up
- social: kahve, yemek, görüşme, buluşma, parti, konser
- finance: banka, fatura, ödeme, vergi
- education: ders, kurs, eğitim, sınav, okul, ödev
Default to 'personal' if unsure.

⏰ Turkish Date/Time Parsing:
- "bugün" = today
- "yarın" = tomorrow  
- "pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar" = weekdays
- "saat 15", "15:00", "3 pm" = time formats
- Default duration: 1 hour if end time not specified
- Default reminder: 15 minutes before

Example conversation flows:

NO ACTION (Just chat):
User: "iyi geceler"
Oscar: "İyi geceler! Yarın görüşürüz." [NO function call]

User: "teşekkürler"
Oscar: "Rica ederim! Yardımcı olabildiysem ne mutlu." [NO function call]

User: "nasılsın"
Oscar: "İyiyim, teşekkürler! Sana nasıl yardımcı olabilirim?" [NO function call]

CREATE:
User: "yarına etkinlik ekle"
Oscar: "Tamamdır! Ne eklememi istersin?"
User: "doktor randevusu"
Oscar: "Anladım! Saat kaçta olacak?"
User: "saat 15"
Oscar: [calls create_event]

QUERY:
User: "bugünün programını göster"
Oscar: [calls query_events with startDate=today, endDate=today]

User: "bu haftaki toplantılar"
Oscar: [calls query_events with searchTerm="toplantı", startDate=week-start, endDate=week-end]

User: "perşembe gününde toplantım var mı?"
Oscar: [calls query_events with searchTerm="toplantı", startDate=Thursday, endDate=Thursday]

User: "yarın ne var?"
Oscar: [calls query_events with startDate=tomorrow, endDate=tomorrow]

User: "bugün etkinliğim var mı?"
Oscar: [calls query_events with startDate=today, endDate=today]

BULK UPDATE:
User: "bugünün sabah etkinliklerini öğleden sonraya al"
Oscar: [First calls query_events to find morning events, then calls bulk_update_events to move them]

BULK DELETE:
User: "cuma gününün hepsini iptal et"
Oscar: [First calls query_events for Friday, then calls bulk_delete_events]

DELETE:
User: "yarın olan matematik dersini kaldır"
Oscar: [First calls query_events to find the math class, remembers the event ID from results]
Oscar: "Matematik dersi bulundu. Kaldırıyorum..." [Then calls delete_event with that ID]

User: "bugünkü toplantıyı iptal et"
Oscar: [Calls query_events for today's meetings, then calls delete_event]`,
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
                  startDate: { type: 'string', description: 'Filter from this date (ISO 8601). Optional.' },
                  endDate: { type: 'string', description: 'Filter until this date (ISO 8601). Optional.' },
                  category: { 
                    type: 'string', 
                    enum: ['work', 'personal', 'health', 'social', 'finance', 'education'],
                    description: 'Filter by category. Optional. Only use if user specifies, otherwise omit.' 
                  },
                  searchTerm: { type: 'string', description: 'Search in title/description. Optional.' },
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
          {
            type: 'function',
            function: {
              name: 'bulk_update_events',
              description: 'Update multiple events at once. Use when user wants to modify multiple events (e.g., "move morning events to afternoon", "change all Monday meetings")',
              parameters: {
                type: 'object',
                properties: {
                  eventIds: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Array of event IDs to update'
                  },
                  updates: { 
                    type: 'object',
                    description: 'Object containing fields to update (e.g., {start, end, location})'
                  },
                },
                required: ['eventIds', 'updates'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'bulk_delete_events',
              description: 'Delete multiple events at once. Use when user wants to remove multiple events (e.g., "cancel all Friday events", "delete this week\'s meetings")',
              parameters: {
                type: 'object',
                properties: {
                  eventIds: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Array of event IDs to delete'
                  },
                },
                required: ['eventIds'],
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
            model: selectedModel, // User-selected model from UI
            messages: [systemMessage, ...apiMessages],
            tools,
            tool_choice: 'auto',
            temperature: 0.7,
            parallel_tool_calls: false, // Prevent multiple simultaneous function calls
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
        let messageContent = assistantMessage.content || '';

        if (toolCalls && toolCalls.length > 0) {
          const toolCall = toolCalls[0];
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          // Clean up function call format from message (Groq sometimes includes <function=...> in content)
          messageContent = messageContent.replace(/<function=.*?<\/function>/g, '').trim();

          switch (functionName) {
            case 'create_event':
              action = { type: 'CREATE_EVENT', payload: functionArgs };
              // Empty message - we'll show action card instead
              messageContent = '';
              break;
            case 'update_event':
              action = { type: 'UPDATE_EVENT', id: functionArgs.id, payload: functionArgs.updates };
              messageContent = '';
              break;
            case 'delete_event':
              action = { type: 'DELETE_EVENT', id: functionArgs.id };
              messageContent = '';
              break;
            case 'bulk_update_events':
              action = { type: 'BULK_UPDATE_EVENTS', eventIds: functionArgs.eventIds, payload: functionArgs.updates };
              messageContent = '';
              break;
            case 'bulk_delete_events':
              action = { type: 'BULK_DELETE_EVENTS', eventIds: functionArgs.eventIds };
              messageContent = '';
              break;
            case 'query_events':
              action = { type: 'QUERY_EVENTS', filter: functionArgs };
              messageContent = ''; // Will be set during action execution
              break;
            default:
              action = { type: 'NO_ACTION', message: messageContent || 'Anladım!' };
          }
        } else {
          // Clean up any accidental function tags even in NO_ACTION responses
          messageContent = messageContent.replace(/<function=.*?<\/function>/g, '').trim();
          action = { type: 'NO_ACTION', message: messageContent || 'Anladım!' };
        }

        data = {
          message: messageContent || 'İşlem yapılıyor...',
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
      let aiResponseText = data.message || '';
      let actionMetadata: ChatMessage['action'] = undefined;
      let queryResults: CalendarEvent[] | undefined = undefined;

      console.log('[AssistantChat] AI response text:', aiResponseText);
      console.log('[AssistantChat] Action data:', data.action);

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
          } else if (isBulkUpdateEventsAction(validatedAction)) {
            console.log('[AssistantChat] Bulk updating events:', validatedAction.eventIds.length, 'events');
            const updatedEvents = [];
            for (const eventId of validatedAction.eventIds) {
              await updateEvent(eventId, validatedAction.payload);
              const event = events.find(e => e.id === eventId);
              if (event) {
                updatedEvents.push({ ...event, ...validatedAction.payload });
              }
            }
            actionMetadata = {
              type: 'bulk_updated',
              events: updatedEvents,
              count: updatedEvents.length,
            };
          } else if (isBulkDeleteEventsAction(validatedAction)) {
            console.log('[AssistantChat] Bulk deleting events:', validatedAction.eventIds.length, 'events');
            const deletedEvents = [];
            for (const eventId of validatedAction.eventIds) {
              const event = events.find(e => e.id === eventId);
              if (event) {
                deletedEvents.push(event);
                await deleteEvent(eventId);
              }
            }
            actionMetadata = {
              type: 'bulk_deleted',
              events: deletedEvents,
              count: deletedEvents.length,
            };
          } else if (isQueryEventsAction(validatedAction)) {
            console.log('[AssistantChat] Querying events:', validatedAction.filter);
            console.log('[AssistantChat] Total events available:', events.length);
            
            // Client-side filtering
            let filteredEvents = [...events];
            const filter = validatedAction.filter || {};
            
            if (filter.startDate) {
              const startDate = new Date(filter.startDate);
              console.log('[AssistantChat] Filtering by startDate:', startDate);
              filteredEvents = filteredEvents.filter(e => new Date(e.start) >= startDate);
              console.log('[AssistantChat] After startDate filter:', filteredEvents.length);
            }
            
            if (filter.endDate) {
              const endDate = new Date(filter.endDate);
              console.log('[AssistantChat] Filtering by endDate:', endDate);
              filteredEvents = filteredEvents.filter(e => new Date(e.start) <= endDate);
              console.log('[AssistantChat] After endDate filter:', filteredEvents.length);
            }
            
            if (filter.category) {
              filteredEvents = filteredEvents.filter(e => e.category === filter.category);
              console.log('[AssistantChat] After category filter:', filteredEvents.length);
            }
            
            if (filter.searchTerm) {
              const term = filter.searchTerm.toLowerCase();
              console.log('[AssistantChat] Filtering by searchTerm:', term);
              filteredEvents = filteredEvents.filter(e => 
                e.title.toLowerCase().includes(term) || 
                e.description?.toLowerCase().includes(term)
              );
              console.log('[AssistantChat] After searchTerm filter:', filteredEvents.length);
            }

            // Save query results to display as cards
            queryResults = filteredEvents;
            console.log('[AssistantChat] Final query results:', queryResults.length, 'events');
            
            // Empty message - cards will show everything
            aiResponseText = '';
          }
        } catch (validationError) {
          console.error('[AssistantChat] Action validation error:', validationError);
        }
      }

      // Add AI response to chat with action metadata and query results
      addMessage({ 
        role: 'assistant', 
        content: aiResponseText,
        timestamp: Date.now(),
        action: actionMetadata,
        queryResults: queryResults,
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
    <div className="h-full w-full flex flex-col items-center bg-background overflow-hidden">
      <div 
        className="w-full max-w-2xl flex flex-col flex-1 relative overflow-hidden"
      >
        {messages.length === 0 ? (
          // Welcome Screen
          <div 
            className="flex-1 flex flex-col items-center justify-center space-y-12 w-full pb-32 p-8 animate-in fade-in duration-500"
          >
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
          <div 
            className="flex-1 w-full overflow-y-auto space-y-6 pb-32 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 scrollbar-hide"
          >
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
                  // AI message - plain text with optional action card or query results
                  <>
                    {/* Only show text if there's actual content */}
                    {msg.content && msg.content.trim() && (
                      <p className="text-lg text-foreground max-w-[80%] whitespace-pre-wrap">{msg.content}</p>
                    )}
                    
                    {/* Action Card (for create/update/delete/conflict) */}
                    {msg.action && (
                      <div className="w-full max-w-[80%]">
                        <ActionCard 
                          type={msg.action.type} 
                          event={msg.action.event}
                          events={msg.action.events}
                          count={msg.action.count}
                          conflictingEvents={msg.action.conflictingEvents}
                        />
                      </div>
                    )}
                    
                    {/* Query Results (for query_events) */}
                    {msg.queryResults !== undefined && (
                      <div className="w-full max-w-[80%] space-y-2">
                        {msg.queryResults.length > 0 ? (
                          msg.queryResults.map((event) => (
                            <Card key={event.id} className="overflow-hidden">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-base">{event.title}</h4>
                                    {event.category && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                        {event.category}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                    <span>{format(new Date(event.start), 'd MMMM yyyy, EEEE', { locale: tr })}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span>
                                      {event.allDay 
                                        ? 'Tüm gün' 
                                        : `${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`
                                      }
                                    </span>
                                  </div>
                                  
                                  {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                  
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground pt-2 border-t">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card className="overflow-hidden">
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground">Bu kriterlere uygun etkinlik bulunamadı.</p>
                            </CardContent>
                          </Card>
                        )}
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

        {/* Input Area - Fixed at Bottom */}
        <div 
          className="fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none transition-all duration-300"
          style={{
            paddingLeft: sidebarState === 'expanded' ? 'calc(var(--sidebar-width, 16rem) + 1.5rem)' : '1.5rem'
          }}
        >
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="relative flex items-center gap-2.5 rounded-2xl border-2 bg-background px-3 py-2.5 shadow-md">
            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

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
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-9"
            />

            <Button
              onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
            </Button>

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
    </div>
  );
}
