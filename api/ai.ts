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
            description: 'Filter events starting from this date (ISO 8601)',
          },
          endDate: {
            type: 'string',
            description: 'Filter events until this date (ISO 8601)',
          },
          category: {
            type: 'string',
            description: 'Filter by category',
          },
          searchTerm: {
            type: 'string',
            description: 'Search in title/description',
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

  const API_KEY = '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';

  try {
    // Add system context with current events
    const systemMessage = {
      role: 'system',
      content: `You are Oscar, a helpful calendar assistant for Calendiq. You help users manage their calendar in Turkish.

Current date/time: ${new Date().toISOString()}

You can:
- Create new events (use create_event function)
- Update existing events (use update_event function with event ID)
- Delete events (use delete_event function with event ID)
- Query/search events (use query_events function)
- Have friendly conversations

${events && events.length > 0 ? `Current user events:\n${events.map((e: any) => `- ${e.title} (${e.start}) [ID: ${e.id}]`).join('\n')}` : 'User has no events yet.'}

IMPORTANT: 
- ALWAYS respond in Turkish
- When user asks about their events, use query_events to search
- When updating/deleting, first query to find the event ID if needed
- Be friendly and helpful
- Auto-categorize events: work, personal, health, social, finance, education
- Default reminder: 15 minutes before

When creating events:
- Parse Turkish dates: "yarın" (tomorrow), "bugün" (today), "pazartesi" (Monday), "salı" (Tuesday), etc.
- Parse times: "saat 15", "15:00", "3 pm", etc.
- Default duration: 1 hour if not specified
- Auto-detect category from context`,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://calendiq.app',
        'X-Title': 'Calendiq',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-instruct:free',
        messages: [systemMessage, ...messages],
        tools,
        tool_choice: 'auto',
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
    
    if (toolCalls && toolCalls.length > 0) {
      // AI wants to call a function
      const toolCall = toolCalls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log('[API] Function call:', functionName, functionArgs);

      // Convert tool call to AIAction format
      let action;
      switch (functionName) {
        case 'create_event':
          action = {
            type: 'CREATE_EVENT',
            payload: functionArgs,
          };
          break;
        case 'update_event':
          action = {
            type: 'UPDATE_EVENT',
            id: functionArgs.id,
            payload: functionArgs.updates,
          };
          break;
        case 'delete_event':
          action = {
            type: 'DELETE_EVENT',
            id: functionArgs.id,
          };
          break;
        case 'query_events':
          action = {
            type: 'QUERY_EVENTS',
            filter: functionArgs,
          };
          break;
        default:
          action = {
            type: 'NO_ACTION',
            message: assistantMessage.content || 'Anladım!',
          };
      }

      return new Response(
        JSON.stringify({
          message: assistantMessage.content || 'İşlem yapılıyor...',
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
          message: assistantMessage.content || 'Anladım!',
          action: {
            type: 'NO_ACTION',
            message: assistantMessage.content || 'Anladım!',
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
