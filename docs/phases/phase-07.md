# Phase 7: Reminder & Notification System

**Status:** Not Started  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 4, 5

---

## Objectives

- Add reminder field to CalendarEvent model
- Implement notification permission request flow
- Create notification service for sending browser notifications
- Build reminder scheduler (background timer)
- Integrate reminder selection in Event Form
- Handle notification click events
- Test notifications on PWA

---

## Tasks

### 7.1 Update Event Model with Reminder Field

**src/types/event.ts:**
```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: 'planned' | 'done' | 'cancelled';
  reminder?: number;              // Minutes before event (0, 5, 10, 15, 30, 60, 1440)
  notificationSent?: boolean;     // Track if reminder was sent
  createdAt: string;
  updatedAt: string;
}

export const REMINDER_OPTIONS = [
  { label: 'No reminder', value: undefined },
  { label: 'At time of event', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
] as const;
```

---

### 7.2 Create Notification Permission Hook

**src/hooks/useNotificationPermission.ts:**
```typescript
import { useEffect, useState } from 'react';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  async function requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (permission === 'granted') return true;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
  };
}
```

---

### 7.3 Create Notification Service

**src/services/notificationService.ts:**
```typescript
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag: string;
  data: {
    eventId: string;
    action: string;
  };
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  // If service worker is available, use it for persistent notifications
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: false,
    });
  } else {
    // Fallback to basic notification (won't persist when PWA is closed)
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      tag: payload.tag,
      data: payload.data,
    });
  }
}

export function formatEventTimeForNotification(start: string): string {
  const date = new Date(start);
  return date.toLocaleString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}
```

---

### 7.4 Create Reminder Scheduler Service

**src/services/reminderScheduler.ts:**
```typescript
import { db } from '@/db/db';
import { sendNotification, formatEventTimeForNotification } from './notificationService';

let schedulerInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler() {
  if (schedulerInterval) {
    console.warn('Reminder scheduler already running');
    return;
  }

  console.log('Starting reminder scheduler');

  // Check every minute for upcoming reminders
  schedulerInterval = setInterval(async () => {
    await checkAndSendReminders();
  }, 60 * 1000); // 60 seconds

  // Run immediately on start
  checkAndSendReminders();
}

export function stopReminderScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Reminder scheduler stopped');
  }
}

async function checkAndSendReminders() {
  try {
    const now = new Date();
    
    // Get all events with reminders
    const events = await db.events
      .where('reminder')
      .notEqual(undefined)
      .toArray();

    for (const event of events) {
      // Skip if notification already sent
      if (event.notificationSent) continue;

      const eventStart = new Date(event.start);
      const reminderTime = new Date(eventStart.getTime() - (event.reminder! * 60 * 1000));

      // Check if reminder time has passed and event hasn't started yet
      if (reminderTime <= now && eventStart > now) {
        // Send notification
        await sendNotification({
          title: event.title,
          body: `Starts at ${formatEventTimeForNotification(event.start)}`,
          tag: event.id,
          data: {
            eventId: event.id,
            action: 'open-event',
          },
        });

        // Mark as sent
        await db.events.update(event.id, { notificationSent: true });
        console.log(`Reminder sent for event: ${event.title}`);
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}
```

---

### 7.5 Update Event Form to Include Reminder Selection

**src/components/Calendar/EventModal.tsx:**

Add reminder field to form state and UI:

```typescript
import { REMINDER_OPTIONS } from '@/types/event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// In form state
const [reminder, setReminder] = useState<number | undefined>(
  event?.reminder
);

// In form JSX (after priority/status fields)
<div>
  <Label htmlFor="reminder">Reminder</Label>
  <Select
    value={reminder?.toString() ?? ''}
    onValueChange={(value) => setReminder(value ? parseInt(value) : undefined)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select reminder" />
    </SelectTrigger>
    <SelectContent>
      {REMINDER_OPTIONS.map((option) => (
        <SelectItem
          key={option.label}
          value={option.value?.toString() ?? ''}
        >
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

// Include in save payload
const eventData = {
  ...otherFields,
  reminder,
  notificationSent: false, // Reset when updating event
};
```

---

### 7.6 Request Notification Permission on First Event with Reminder

**src/components/Calendar/EventModal.tsx:**

```typescript
import { useNotificationPermission } from '@/hooks/useNotificationPermission';

function EventModal({ ... }) {
  const { isGranted, requestPermission } = useNotificationPermission();

  async function handleSave() {
    // ... validation

    // If reminder is set and permission not granted, request it
    if (reminder !== undefined && !isGranted) {
      const granted = await requestPermission();
      if (!granted) {
        alert('Notification permission denied. Reminders will not work.');
        // Continue saving event anyway
      }
    }

    // Save event
    await saveEvent(eventData);
  }

  // ...
}
```

---

### 7.7 Initialize Reminder Scheduler in App

**src/App.tsx:**
```typescript
import { useEffect } from 'react';
import { startReminderScheduler, stopReminderScheduler } from '@/services/reminderScheduler';

function App() {
  useEffect(() => {
    // Start scheduler when app mounts
    startReminderScheduler();

    // Cleanup on unmount
    return () => {
      stopReminderScheduler();
    };
  }, []);

  return (
    // ... rest of app
  );
}
```

---

### 7.8 Handle Notification Click Events (Service Worker)

**public/sw.js** (or via Vite PWA plugin config):

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const eventId = event.notification.data?.eventId;
  
  if (!eventId) return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If PWA is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'OPEN_EVENT',
            eventId: eventId,
          });
          return;
        }
      }

      // Otherwise, open new window
      if (clients.openWindow) {
        return clients.openWindow(`/?eventId=${eventId}`);
      }
    })
  );
});
```

**src/App.tsx** (listen for service worker messages):
```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'OPEN_EVENT') {
        const eventId = event.data.eventId;
        // Open event modal or navigate to event
        // (implement based on your routing/modal logic)
        console.log('Open event:', eventId);
      }
    });
  }
}, []);
```

---

### 7.9 Update AI Action Schema to Parse Reminders

**src/types/ai.ts:**

Update the CREATE_EVENT action to include reminder:

```typescript
z.object({
  type: z.literal('CREATE_EVENT'),
  payload: z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    allDay: z.boolean().optional(),
    reminder: z.number().optional(), // Parse from "10 dakika önce hatırlat"
  }),
}),
```

Update OpenAI system prompt to parse reminder phrases:
- "10 dakika önce hatırlat" → `reminder: 10`
- "1 saat önce hatırlat" → `reminder: 60`
- "1 gün önce hatırlat" → `reminder: 1440`

---

## Testing Checklist

- [ ] Reminder field added to Event model
- [ ] Reminder dropdown appears in Event Form
- [ ] Notification permission is requested when creating event with reminder
- [ ] Reminder scheduler runs in background (check console logs)
- [ ] Notification appears at correct time (test with 1-minute reminder)
- [ ] Clicking notification opens PWA and highlights event
- [ ] Reminder works when PWA is open
- [ ] Reminder works when PWA is in background (service worker active)
- [ ] AI commands parse reminder correctly ("10 dakika önce hatırlat")
- [ ] Multiple events with different reminders work correctly
- [ ] notificationSent flag prevents duplicate notifications

---

## Acceptance Criteria

- [ ] Users can select reminder when creating/editing events
- [ ] Notification permission requested on first reminder usage
- [ ] Background scheduler checks for upcoming reminders every minute
- [ ] Notifications sent at correct time
- [ ] Clicking notification opens event detail
- [ ] Works both when PWA is open and in background
- [ ] AI can parse reminder phrases from user input
- [ ] No duplicate notifications for same event

---

## Known Limitations

- **Browser closed completely:** Service worker may not run, notifications may not fire (platform-dependent)
- **iOS Safari PWA:** Background notifications have limited support
- **Single reminder per event:** MVP supports only one reminder time (future: multiple reminders)
- **No snooze:** Users cannot snooze notifications (future enhancement)

---

## Next Phase

Proceed to **Phase 8: Conflict Detection & Validation**
