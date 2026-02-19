import type { CalendarEvent, EventFilter } from '@/types/event';

/**
 * Event Repository Interface
 * Manages calendar events storage and queries
 */
export interface IEventRepository {
  /**
   * Create a new event
   */
  create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;

  /**
   * Update an existing event
   */
  update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;

  /**
   * Delete an event
   */
  delete(id: string): Promise<void>;

  /**
   * Get event by ID
   */
  getById(id: string): Promise<CalendarEvent | undefined>;

  /**
   * Get all events
   */
  getAll(): Promise<CalendarEvent[]>;

  /**
   * Get events within a date range
   */
  getByDateRange(start: string, end: string): Promise<CalendarEvent[]>;

  /**
   * Query events with filters
   */
  query(filter: EventFilter): Promise<CalendarEvent[]>;
}
