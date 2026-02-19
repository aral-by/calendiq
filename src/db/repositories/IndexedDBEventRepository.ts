import { db } from '@/db';
import type { CalendarEvent, EventFilter } from '@/types/event';
import type { IEventRepository } from './IEventRepository';

/**
 * IndexedDB implementation of Event Repository
 */
export class IndexedDBEventRepository implements IEventRepository {
  async create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.events.add(newEvent);
    return newEvent;
  }

  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await db.events.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error('Event not found');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.events.delete(id);
  }

  async getById(id: string): Promise<CalendarEvent | undefined> {
    return await db.events.get(id);
  }

  async getAll(): Promise<CalendarEvent[]> {
    return await db.events.toArray();
  }

  async getByDateRange(start: string, end: string): Promise<CalendarEvent[]> {
    return await db.events
      .where('start')
      .between(start, end, true, true)
      .toArray();
  }

  async query(filter: EventFilter): Promise<CalendarEvent[]> {
    let collection = db.events.toCollection();

    // Apply filters
    if (filter.dateRange) {
      collection = db.events
        .where('start')
        .between(filter.dateRange.start, filter.dateRange.end, true, true);
    }

    // Get all results and filter in memory for other criteria
    const results = await collection.toArray();

    return results.filter((event) => {
      if (filter.category && event.category !== filter.category) return false;
      if (filter.priority && event.priority !== filter.priority) return false;
      if (filter.status && event.status !== filter.status) return false;
      if (filter.isRecurring !== undefined && event.isRecurring !== filter.isRecurring) return false;
      if (filter.tags && filter.tags.length > 0) {
        const eventTags = event.tags || [];
        const hasTag = filter.tags.some((tag) => eventTags.includes(tag));
        if (!hasTag) return false;
      }
      return true;
    });
  }
}
