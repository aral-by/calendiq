# Phase 7: Conflict Detection & Validation

**Status:** Not Started  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 4

---

## Objectives

- Implement robust event overlap detection
- Create conflict warning UI
- Add validation for all event inputs
- Handle edge cases (all-day events, etc.)

---

## Tasks

### 7.1 Create Conflict Detection Service

**src/services/conflictDetector.ts:**
```typescript
import type { CalendarEvent } from '@/types/event';

export function detectConflicts(
  events: CalendarEvent[],
  newStart: string,
  newEnd: string,
  excludeId?: string
): CalendarEvent[] {
  return events.filter(event => {
    // Skip the event being updated
    if (excludeId && event.id === excludeId) return false;

    // Check for overlap
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const checkStart = new Date(newStart);
    const checkEnd = new Date(newEnd);

    // Overlap logic: (start1 < end2) AND (end1 > start2)
    return checkStart < eventEnd && checkEnd > eventStart;
  });
}

export function formatConflictMessage(conflicts: CalendarEvent[]): string {
  if (conflicts.length === 0) return '';
  
  if (conflicts.length === 1) {
    const event = conflicts[0];
    return `This time conflicts with "${event.title}" (${new Date(event.start).toLocaleString()})`;
  }

  return `This time conflicts with ${conflicts.length} other events`;
}
```

---

### 7.2 Create Conflict Warning Modal

**src/components/Calendar/ConflictWarning.tsx:**
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CalendarEvent } from '@/types/event';

interface ConflictWarningProps {
  open: boolean;
  conflicts: CalendarEvent[];
  onContinue: () => void;
  onCancel: () => void;
}

export function ConflictWarning({ open, conflicts, onContinue, onCancel }: ConflictWarningProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Schedule Conflict</AlertDialogTitle>
          <AlertDialogDescription>
            This event conflicts with:
            <ul className="mt-2 space-y-1">
              {conflicts.map(event => (
                <li key={event.id} className="text-sm">
                  • {event.title} ({new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()})
                </li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Save Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### 7.3 Update Event Form with Conflict Detection

**src/components/Calendar/EventForm.tsx (update):**
```typescript
import { useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { detectConflicts } from '@/services/conflictDetector';
import { ConflictWarning } from './ConflictWarning';

export function EventForm({ eventId, onSuccess }: EventFormProps) {
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const { events, createEvent, updateEvent } = useEvents();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End time must be after start time');
      return;
    }

    // Check for conflicts
    const foundConflicts = detectConflicts(
      events,
      startDate,
      endDate,
      eventId || undefined
    );

    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      setShowConflictWarning(true);
      return;
    }

    await saveEvent();
  }

  async function saveEvent() {
    // Save logic...
    onSuccess();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields... */}
      </form>

      <ConflictWarning
        open={showConflictWarning}
        conflicts={conflicts}
        onContinue={() => {
          setShowConflictWarning(false);
          saveEvent();
        }}
        onCancel={() => setShowConflictWarning(false)}
      />
    </>
  );
}
```

---

### 7.4 Add Input Validation

**src/lib/validators.ts:**
```typescript
import { z } from 'zod';

export const EventFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  start: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date'),
  end: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end date'),
  allDay: z.boolean(),
  color: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['planned', 'done', 'cancelled']).optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => new Date(data.end) > new Date(data.start), {
  message: 'End time must be after start time',
  path: ['end'],
});
```

---

### 7.5 Add Offline Detection

**src/hooks/useOnlineStatus.ts:**
```typescript
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

---

### 7.6 Update Chat Input with Offline Warning

**src/components/Chat/ChatInput.tsx (update):**
```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function ChatInput({ onSend }: ChatInputProps) {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-sm">
          You're offline. AI features unavailable. Use manual event creation.
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Input fields... */}
        <Button disabled={!isOnline || sending}>Send</Button>
      </form>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] Conflict detection works for overlapping events
- [ ] Warning modal shows conflicting events
- [ ] User can choose to save anyway or cancel
- [ ] All-day events handled correctly
- [ ] Input validation prevents invalid data
- [ ] Error messages clear and helpful
- [ ] Offline status detected
- [ ] AI chat disabled when offline

---

## Next Phase

Proceed to **Phase 8: PWA Configuration & Deployment**
