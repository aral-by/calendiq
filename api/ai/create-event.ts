import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CalendarEvent } from '../../src/types/event';

/**
 * AI-Powered Event Creation
 * 
 * POST /api/ai/create-event
 * 
 * Accepts natural language prompt and creates event
 * Example: "Yarın saat 15'te doktor randevum var"
 */

// Simple NLP parser for Turkish event creation (MVP version)
// TODO: Replace with OpenAI GPT-4 when ai-sdk/openai is installed
function parseEventFromPrompt(prompt: string): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date();
  let startDate = now;
  let title = prompt;
  let description = '';

  // Parse time patterns (basic Turkish NLP)
  const timePatterns = [
    { regex: /(\d{1,2}):(\d{2})/, extract: (m: RegExpMatchArray) => ({ hour: parseInt(m[1]), minute: parseInt(m[2]) }) },
    { regex: /saat (\d{1,2})/, extract: (m: RegExpMatchArray) => ({ hour: parseInt(m[1]), minute: 0 }) },
  ];

  // Parse date patterns
  const datePatterns: Array<{keyword: string; offset?: number; dayOfWeek?: number}> = [
    { keyword: 'yarın', offset: 1 },
    { keyword: 'bugün', offset: 0 },
    { keyword: 'pazartesi', dayOfWeek: 1 },
    { keyword: 'salı', dayOfWeek: 2 },
    { keyword: 'çarşamba', dayOfWeek: 3 },
    { keyword: 'perşembe', dayOfWeek: 4 },
    { keyword: 'cuma', dayOfWeek: 5 },
    { keyword: 'cumartesi', dayOfWeek: 6 },
    { keyword: 'pazar', dayOfWeek: 0 },
  ];

  const lowerPrompt = prompt.toLowerCase();

  // Extract time
  for (const pattern of timePatterns) {
    const match = lowerPrompt.match(pattern.regex);
    if (match) {
      const { hour, minute } = pattern.extract(match);
      startDate.setHours(hour, minute, 0, 0);
      break;
    }
  }

  // Extract date
  for (const pattern of datePatterns) {
    if (lowerPrompt.includes(pattern.keyword)) {
      if ('offset' in pattern) {
        startDate = new Date(now);
        startDate.setDate(now.getDate() + pattern.offset);
      } else if ('dayOfWeek' in pattern) {
        startDate = new Date(now);
        const currentDay = now.getDay();
        let daysToAdd = pattern.dayOfWeek - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week
        startDate.setDate(now.getDate() + daysToAdd);
      }
      break;
    }
  }

  // Extract title (remove time/date keywords)
  title = prompt
    .replace(/\d{1,2}:\d{2}/g, '')
    .replace(/saat \d{1,2}/g, '')
    .replace(/yarın|bugün|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar/gi, '')
    .trim();

  // Default end date (1 hour later)
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 1);

  return {
    title: title || 'Yeni Etkinlik',
    description,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    allDay: false,
    location: '',
    tags: [],
    color: '#8B5CF6', // Default purple
    reminder: 15, // 15 minutes
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    console.log('[AI Event] Parsing prompt:', prompt);

    // Parse event from natural language
    const eventData = parseEventFromPrompt(prompt);

    // Create event with metadata
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[AI Event] Created event:', newEvent);

    return res.status(201).json({
      success: true,
      event: newEvent,
      parsed: {
        title: eventData.title,
        start: eventData.start,
        end: eventData.end,
      },
    });

  } catch (error) {
    console.error('[AI Event] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create event from prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
