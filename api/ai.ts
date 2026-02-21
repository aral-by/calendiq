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
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: await convertToModelMessages(messages),
      system: `You are a calendar assistant for Calendiq. Help users manage their calendar in Turkish.

You can help users:
- Create new events
- Update existing events  
- Delete events
- Query their calendar

ALWAYS respond naturally in Turkish. Be helpful and friendly.

Current date/time: ${new Date().toISOString()}

When creating events, automatically categorize them:
- "work": meetings, presentations, deadlines, projects
- "personal": home tasks, personal appointments, errands
- "health": doctor visits, gym, exercise, wellness
- "social": dinners, parties, meetups with friends
- "finance": bill payments, bank appointments, taxes
- "education": classes, courses, training, learning

Priority levels: low, medium, high
Default reminder: 15 minutes before event`,
    });

    return result.toTextStreamResponse();
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
