# Phase 2: Database Layer & Repository Pattern

**Status:** Not Started  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 1

---

## Objectives

- Set up Dexie.js for IndexedDB
- Define database schema
- Implement repository pattern interfaces
- Create IndexedDB repository implementations
- Add utility functions for data operations

---

## Tasks

### 2.1 Install Database Dependencies

```bash
npm install dexie dexie-react-hooks
```

---

### 2.2 Define TypeScript Interfaces

**src/types/user.ts:**
```typescript
export interface UserProfile {
  id: 1; // Always 1 (single user)
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601: "YYYY-MM-DD"
  pinHash: string;
  createdAt: string; // ISO 8601
}
```

**src/types/event.ts:**
```typescript
export interface CalendarEvent {
  id: string; // UUID
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  allDay: boolean;
  color?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'planned' | 'done' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

**src/types/chat.ts:**
```typescript
export interface ChatMessage {
  id: string; // UUID
  userMessage: string;
  aiResponse?: string;
  timestamp: string; // ISO 8601
  actionType?: string;
  actionPayload?: any;
}
```

---

### 2.3 Create Dexie Database Instance

**src/db/index.ts:**
```typescript
import Dexie, { Table } from 'dexie';
import type { UserProfile } from '@/types/user';
import type { CalendarEvent } from '@/types/event';
import type { ChatMessage } from '@/types/chat';

export class CalendiqDatabase extends Dexie {
  user_profile!: Table<UserProfile, number>;
  events!: Table<CalendarEvent, string>;
  chat_messages!: Table<ChatMessage, string>;

  constructor() {
    super('CalendiqDB');
    
    this.version(1).stores({
      user_profile: 'id',
      events: 'id, start, end, status',
      chat_messages: 'id, timestamp'
    });
  }
}

export const db = new CalendiqDatabase();
```

---

### 2.4 Create Repository Interfaces

**src/db/repositories/IUserRepository.ts:**
```typescript
import type { UserProfile } from '@/types/user';

export interface IUserRepository {
  get(): Promise<UserProfile | undefined>;
  create(profile: Omit<UserProfile, 'id'>): Promise<UserProfile>;
  update(updates: Partial<UserProfile>): Promise<UserProfile>;
  exists(): Promise<boolean>;
}
```

**src/db/repositories/IEventRepository.ts:**
```typescript
import type { CalendarEvent } from '@/types/event';

export interface IEventRepository {
  create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;
  update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<CalendarEvent | undefined>;
  getAll(): Promise<CalendarEvent[]>;
  getByDateRange(start: string, end: string): Promise<CalendarEvent[]>;
}
```

**src/db/repositories/IChatRepository.ts:**
```typescript
import type { ChatMessage } from '@/types/chat';

export interface IChatRepository {
  create(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getAll(): Promise<ChatMessage[]>;
  getRecent(limit: number): Promise<ChatMessage[]>;
  clear(): Promise<void>;
}
```

---

### 2.5 Implement IndexedDB Repositories

**src/db/repositories/IndexedDBUserRepository.ts:**
```typescript
import { db } from '@/db';
import type { UserProfile } from '@/types/user';
import type { IUserRepository } from './IUserRepository';

export class IndexedDBUserRepository implements IUserRepository {
  async get(): Promise<UserProfile | undefined> {
    return await db.user_profile.get(1);
  }

  async create(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: 1,
    };
    await db.user_profile.add(newProfile);
    return newProfile;
  }

  async update(updates: Partial<UserProfile>): Promise<UserProfile> {
    await db.user_profile.update(1, updates);
    const updated = await this.get();
    if (!updated) throw new Error('User profile not found');
    return updated;
  }

  async exists(): Promise<boolean> {
    const count = await db.user_profile.count();
    return count > 0;
  }
}
```

**src/db/repositories/IndexedDBEventRepository.ts:**
```typescript
import { db } from '@/db';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent } from '@/types/event';
import type { IEventRepository } from './IEventRepository';

export class IndexedDBEventRepository implements IEventRepository {
  async create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const now = new Date().toISOString();
    const newEvent: CalendarEvent = {
      ...event,
      id: uuidv4(),
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
    if (!updated) throw new Error('Event not found');
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
}
```

**src/db/repositories/IndexedDBChatRepository.ts:**
```typescript
import { db } from '@/db';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/types/chat';
import type { IChatRepository } from './IChatRepository';

export class IndexedDBChatRepository implements IChatRepository {
  async create(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
    };
    await db.chat_messages.add(newMessage);
    return newMessage;
  }

  async getAll(): Promise<ChatMessage[]> {
    return await db.chat_messages.orderBy('timestamp').toArray();
  }

  async getRecent(limit: number): Promise<ChatMessage[]> {
    return await db.chat_messages
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async clear(): Promise<void> {
    await db.chat_messages.clear();
  }
}
```

---

### 2.6 Create Repository Barrel Export

**src/db/repositories/index.ts:**
```typescript
export * from './IUserRepository';
export * from './IEventRepository';
export * from './IChatRepository';
export * from './IndexedDBUserRepository';
export * from './IndexedDBEventRepository';
export * from './IndexedDBChatRepository';
```

---

### 2.7 Create Utility Functions

**src/lib/dateUtils.ts:**
```typescript
export function isOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return new Date(start1) < new Date(end2) && new Date(end1) > new Date(start2);
}

export function formatDateForCalendar(date: Date): string {
  return date.toISOString();
}
```

---

### 2.8 Test Database Operations

Create a test file (temporary, can be deleted later):

**src/db/test.ts:**
```typescript
import { db } from '@/db';
import { IndexedDBEventRepository } from '@/db/repositories';

async function testDB() {
  const eventRepo = new IndexedDBEventRepository();
  
  // Create test event
  const event = await eventRepo.create({
    title: 'Test Event',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 3600000).toISOString(),
    allDay: false,
  });
  
  console.log('Created event:', event);
  
  // Get all events
  const allEvents = await eventRepo.getAll();
  console.log('All events:', allEvents);
  
  // Clean up
  await eventRepo.delete(event.id);
  console.log('Test complete');
}

testDB();
```

---

## Acceptance Criteria

- [ ] Dexie.js successfully initializes IndexedDB
- [ ] All three stores (user_profile, events, chat_messages) created
- [ ] Repository interfaces defined for all entities
- [ ] IndexedDB repository implementations working
- [ ] CRUD operations tested for events
- [ ] User profile can be created and retrieved
- [ ] Chat messages can be stored and fetched
- [ ] No TypeScript errors

---

## Testing

```typescript
// In browser console or test file
import { db } from '@/db';
import { IndexedDBEventRepository } from '@/db/repositories';

// Check database
await db.open();
console.log(db.isOpen()); // true

// Test repositories
const repo = new IndexedDBEventRepository();
await repo.getAll(); // []
```

---

## Next Phase

Proceed to **Phase 3: Authentication & PIN System**
