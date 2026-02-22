import type { CalendarEvent } from '@/types/event';

/**
 * Event API Client
 * 
 * Handles all API communication for event operations
 * Works with Vercel Serverless endpoints
 */

const API_BASE = '/api/events';

class EventAPIClient {
  /**
   * Get all events with optional filters
   */
  async getAll(filters?: {
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.tags?.length) params.append('tags', filters.tags.join(','));

      const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('[EventAPI] Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get single event by ID
   */
  async getById(id: string): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error(`Failed to fetch event: ${response.statusText}`);
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('[EventAPI] Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Create new event
   */
  async create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('[EventAPI] Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update existing event
   */
  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('[EventAPI] Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('[EventAPI] Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Create event from natural language prompt (AI)
   */
  async createWithAI(prompt: string): Promise<{
    event: CalendarEvent;
    parsed: {
      title: string;
      start: string;
      end: string;
    };
  }> {
    try {
      const response = await fetch('/api/ai/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event with AI');
      }

      const data = await response.json();
      return {
        event: data.event,
        parsed: data.parsed,
      };
    } catch (error) {
      console.error('[EventAPI] Error creating event with AI:', error);
      throw error;
    }
  }

  /**
   * Batch operations
   */
  async createBatch(events: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CalendarEvent[]> {
    try {
      const promises = events.map(event => this.create(event));
      return await Promise.all(promises);
    } catch (error) {
      console.error('[EventAPI] Error creating batch events:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(API_BASE);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const eventAPI = new EventAPIClient();

// Export class for testing
export { EventAPIClient };
