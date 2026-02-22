export const config = {
  runtime: 'edge',
};

// Tool definitions for function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Create a new calendar event. Use this when the user asks to add, create, or schedule an event.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Event title/name',
          },
          start: {
            type: 'string',
            description: 'Start date and time in ISO 8601 format (e.g., 2024-03-15T14:00:00)',
          },
          end: {
            type: 'string',
            description: 'End date and time in ISO 8601 format',
          },
          description: {
            type: 'string',
            description: 'Event description (optional)',
          },
          location: {
            type: 'string',
            description: 'Event location (optional)',
          },
          allDay: {
            type: 'boolean',
            description: 'Whether this is an all-day event (optional, default false)',
          },
          category: {
            type: 'string',
            enum: ['work', 'personal', 'health', 'social', 'finance', 'education'],
            description: 'Event category based on type (work/personal/health/social/finance/education)',
          },
          reminder: {
            type: 'number',
            description: 'Reminder time in minutes before event (e.g., 15 for 15 minutes before)',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Event priority level',
          },
        },
        required: ['title', 'start', 'end'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_event',
      description: 'Update an existing calendar event. You must know the event ID to use this function.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique ID of the event to update',
          },
          updates: {
            type: 'object',
            description: 'Object containing fields to update (title, start, end, description, location, etc.)',
          },
        },
        required: ['id', 'updates'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_event',
      description: 'Delete a calendar event. You must know the event ID to use this function.',
      parameters: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'The unique ID of the event to delete',
          },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_events',
      description: 'Query/search calendar events. Use this to find events, check schedule, or answer questions about existing events.',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Filter events starting from this date (ISO 8601). Optional.',
          },
          endDate: {
            type: 'string',
            description: 'Filter events until this date (ISO 8601). Optional.',
          },
          category: {
            type: 'string',
            enum: ['work', 'personal', 'health', 'social', 'finance', 'education'],
            description: 'Filter by category. Optional. Only use if user specifies category, otherwise omit this parameter.',
          },
          searchTerm: {
            type: 'string',
            description: 'Search in title/description. Optional.',
          },
        },
      },
    },
  },
];

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages, events } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get API key from environment variable
  const API_KEY = process.env.GROQ_API_KEY;
  
  if (!API_KEY) {
    console.error('[API] GROQ_API_KEY not configured');
    return new Response(
      JSON.stringify({ 
        error: 'API key not configured',
        details: 'GROQ_API_KEY environment variable is missing'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Add system context with current events
    // Get current Turkey time
    const now = new Date();
    const turkeyTime = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'long' });
    const isoTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })).toISOString();
    
    const systemMessage = {
      role: 'system',
      content: `You are Oscar, the friendly and witty calendar assistant for Calendiq. You help Turkish users manage their schedules with personality and humor.

🗓️ Current date/time (Turkey UTC+3): ${turkeyTime}
ISO: ${isoTime}

${events && events.length > 0 ? `📅 User's current events:\n${events.map((e: any) => `  • ${e.title} - ${e.start} [ID: ${e.id}]`).join('\n')}` : '📭 User has no events yet.'}

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
- For queries, ALWAYS use query_events function - NEVER list events manually in text
- When user asks "bugünün programı", "yarın ne var", "etkinliklerim", etc., CALL query_events function
- For updates/deletes, use update_event or delete_event
- ALWAYS respond in Turkish
- Use Turkey timezone (UTC+3) for all calculations
- If user asks about results just shown (e.g., "detayları var mı?"), DON'T call functions - just answer from context
- Events already displayed have all details - user can see them on screen
- When calling functions, use proper JSON format (not XML tags)

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
Oscar: [calls query_events with searchTerm="toplantı", startDate=week-start, endDate=week-end]`,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [systemMessage, ...messages],
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        parallel_tool_calls: false, // Prevent multiple simultaneous function calls
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] OpenRouter error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'AI service error', 
          details: `Status ${response.status}` 
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log('[API] OpenRouter response:', JSON.stringify(data, null, 2));

    // Extract the assistant's response
    const assistantMessage = data.choices[0]?.message;
    
    if (!assistantMessage) {
      throw new Error('No assistant message in response');
    }

    // Check if there are tool calls
    const toolCalls = assistantMessage.tool_calls;
    let messageContent = assistantMessage.content || '';
    
    if (toolCalls && toolCalls.length > 0) {
      // AI wants to call a function
      const toolCall = toolCalls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log('[API] Function call:', functionName, functionArgs);

      // Clean up function call format from message (Groq sometimes includes <function=...> in content)
      messageContent = messageContent.replace(/<function=.*?<\/function>/g, '').trim();

      // Convert tool call to AIAction format
      let action;
      switch (functionName) {
        case 'create_event':
          action = {
            type: 'CREATE_EVENT',
            payload: functionArgs,
          };
          // Empty message - client will show action card instead
          messageContent = '';
          break;
        case 'update_event':
          action = {
            type: 'UPDATE_EVENT',
            id: functionArgs.id,
            payload: functionArgs.updates,
          };
          messageContent = '';
          break;
        case 'delete_event':
          action = {
            type: 'DELETE_EVENT',
            id: functionArgs.id,
          };
          messageContent = '';
          break;
        case 'query_events':
          action = {
            type: 'QUERY_EVENTS',
            filter: functionArgs,
          };
          messageContent = ''; // Client will set appropriate message during execution
          break;
        default:
          action = {
            type: 'NO_ACTION',
            message: messageContent || 'Anladım!',
          };
      }

      return new Response(
        JSON.stringify({
          message: messageContent,
          action,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // No function call, just conversation
      return new Response(
        JSON.stringify({
          message: messageContent || 'Anladım!',
          action: {
            type: 'NO_ACTION',
            message: messageContent || 'Anladım!',
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('[API] Error processing AI request:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
