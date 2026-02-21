import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('[API] OpenAI API key not configured');
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a calendar assistant for Calendiq. Parse user requests and return JSON actions.

Available actions:
- CREATE_EVENT: Create a new calendar event
- UPDATE_EVENT: Modify an existing event
- DELETE_EVENT: Remove an event
- QUERY_EVENTS: Search or list events
- NO_ACTION: Just conversational response

ALWAYS return valid JSON in this exact format:

{
  "type": "CREATE_EVENT",
  "payload": {
    "title": "Event title",
    "start": "2026-02-24T15:00:00Z",
    "end": "2026-02-24T16:00:00Z",
    "description": "Optional description",
    "location": "Optional location",
    "allDay": false,
    "category": "work",
    "categoryColor": "#3b82f6",
    "reminder": 15,
    "priority": "medium"
  }
}

EVENT CATEGORIES (auto-assign based on context):
- "work": meetings, presentations, deadlines, projects (color: #3b82f6 - blue)
- "personal": home tasks, personal appointments, errands (color: #10b981 - green)
- "health": doctor visits, gym, exercise, wellness (color: #ef4444 - red)
- "social": dinners, parties, meetups with friends (color: #f97316 - orange)
- "finance": bill payments, bank appointments, taxes (color: #8b5cf6 - purple)
- "education": classes, courses, training, learning (color: #06b6d4 - cyan)

PRIORITY LEVELS:
- "low": Optional, low importance
- "medium": Normal importance (default)
- "high": Urgent, important

REMINDER OPTIONS (in minutes):
- 0: At event time
- 5, 10, 15, 30: Minutes before
- 60: 1 hour before
- 1440: 1 day before

Turkish language support - understand commands in Turkish:
- "yarın saat 15'te doktor randevum var" → CREATE_EVENT with category: health
- "pazartesi 10'da toplantı" → CREATE_EVENT with category: work
- "cumartesi akşam yemeği" → CREATE_EVENT with category: social

Current date/time context: ${new Date().toISOString()}

For UPDATE_EVENT:
{
  "type": "UPDATE_EVENT",
  "id": "event-uuid",
  "payload": { "title": "New title", ... }
}

For DELETE_EVENT:
{
  "type": "DELETE_EVENT",
  "id": "event-uuid"
}

For QUERY_EVENTS:
{
  "type": "QUERY_EVENTS",
  "filter": { "category": "work", "dateRange": {...} }
}

For NO_ACTION (just conversation):
{
  "type": "NO_ACTION",
  "message": "Your friendly response here"
}

IMPORTANT: Always use ISO 8601 date format. Always include category and categoryColor for CREATE_EVENT.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    const action = JSON.parse(aiResponse);

    console.log('[API] AI action:', action.type);

    return res.status(200).json({ action, message: aiResponse });
  } catch (error) {
    console.error('[API] Error processing AI request:', error);
    return res.status(500).json({ 
      error: 'Failed to process AI request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
