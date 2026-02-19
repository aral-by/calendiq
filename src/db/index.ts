import Dexie, { Table } from 'dexie';
import type { UserProfile } from '@/types/user';
import type { CalendarEvent } from '@/types/event';
import type { ChatMessage } from '@/types/chat';

export class CalendiqDatabase extends Dexie {
  // Tables
  user_profile!: Table<UserProfile, number>;
  events!: Table<CalendarEvent, string>;
  chat_messages!: Table<ChatMessage, string>;

  constructor() {
    super('CalendiqDB');
    
    // Schema version 1
    this.version(1).stores({
      user_profile: 'id',
      events: 'id, start, end, status, category, recurringEventId',
      chat_messages: 'id, timestamp'
    });
  }
}

// Export singleton instance
export const db = new CalendiqDatabase();
