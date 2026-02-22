import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CalendarEvent } from '../../src/types/event';

/**
 * Event API Endpoints
 * 
 * GET  /api/events - Get all events (with optional filters)
 * POST /api/events - Create a new event
 */

// In-memory storage for MVP (replace with database later)
// TODO: Replace with PostgreSQL/MongoDB/Supabase
let events: CalendarEvent[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Retrieve all events
    if (req.method === 'GET') {
      // Optional query filters
      const { startDate, endDate, tags } = req.query;

      let filteredEvents = events;

      // Filter by date range
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= start && eventDate <= end;
        });
      }

      // Filter by tags
      if (tags) {
        const tagArray = (tags as string).split(',');
        filteredEvents = filteredEvents.filter(event =>
          event.tags?.some(tag => tagArray.includes(tag))
        );
      }

      return res.status(200).json({
        success: true,
        events: filteredEvents,
        count: filteredEvents.length,
      });
    }

    // POST: Create new event
    if (req.method === 'POST') {
      const eventData = req.body;

      // Validation
      if (!eventData.title || !eventData.start) {
        return res.status(400).json({
          success: false,
          error: 'Title and start date are required',
        });
      }

      // Create event with metadata
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      events.push(newEvent);

      console.log('[Events API] Created event:', newEvent.id);

      return res.status(201).json({
        success: true,
        event: newEvent,
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });

  } catch (error) {
    console.error('[Events API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
