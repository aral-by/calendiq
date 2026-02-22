import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { CalendarEvent } from '../../src/types/event';

/**
 * Single Event API Endpoints
 * 
 * GET    /api/events/[id] - Get event by ID
 * PUT    /api/events/[id] - Update event
 * DELETE /api/events/[id] - Delete event
 */

// In-memory storage (shared with index.ts - replace with database)
// TODO: Replace with actual database connection
let events: CalendarEvent[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Event ID is required',
    });
  }

  try {
    // GET: Get single event
    if (req.method === 'GET') {
      const event = events.find(e => e.id === id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      return res.status(200).json({
        success: true,
        event,
      });
    }

    // PUT: Update event
    if (req.method === 'PUT') {
      const eventIndex = events.findIndex(e => e.id === id);

      if (eventIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      const updates = req.body;
      const updatedEvent: CalendarEvent = {
        ...events[eventIndex],
        ...updates,
        id, // Preserve ID
        updatedAt: new Date().toISOString(),
      };

      events[eventIndex] = updatedEvent;

      console.log('[Events API] Updated event:', id);

      return res.status(200).json({
        success: true,
        event: updatedEvent,
      });
    }

    // DELETE: Delete event
    if (req.method === 'DELETE') {
      const eventIndex = events.findIndex(e => e.id === id);

      if (eventIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        });
      }

      events.splice(eventIndex, 1);

      console.log('[Events API] Deleted event:', id);

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
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
