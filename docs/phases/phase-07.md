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

### 7.10 Add Daily Summary Notifications

Send a morning summary of the day's events at 08:00.

**src/services/dailySummaryService.ts:**
```typescript
import { db } from '@/db/db';
import { sendNotification } from './notificationService';
import { startOfDay, endOfDay } from 'date-fns';

let dailySummaryInterval: NodeJS.Timeout | null = null;

export function startDailySummaryScheduler() {
  if (dailySummaryInterval) {
    console.warn('Daily summary scheduler already running');
    return;
  }

  console.log('Starting daily summary scheduler');

  // Check every hour if it's 08:00
  dailySummaryInterval = setInterval(async () => {
    await checkAndSendDailySummary();
  }, 60 * 60 * 1000); // 1 hour

  // Run immediately on start (if it's 08:00)
  checkAndSendDailySummary();
}

export function stopDailySummaryScheduler() {
  if (dailySummaryInterval) {
    clearInterval(dailySummaryInterval);
    dailySummaryInterval = null;
    console.log('Daily summary scheduler stopped');
  }
}

async function checkAndSendDailySummary() {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Only send at 08:00 (hour 8)
    if (currentHour !== 8) return;

    // Check if we already sent today (using localStorage flag)
    const lastSentDate = localStorage.getItem('lastDailySummaryDate');
    const today = now.toDateString();

    if (lastSentDate === today) {
      console.log('Daily summary already sent today');
      return;
    }

    // Get user preference (check if daily summary is enabled)
    const dailySummaryEnabled = localStorage.getItem('dailySummaryEnabled') !== 'false'; // Default: enabled
    if (!dailySummaryEnabled) return;

    // Get today's events
    const todayStart = startOfDay(now).toISOString();
    const todayEnd = endOfDay(now).toISOString();

    const todayEvents = await db.events
      .where('start')
      .between(todayStart, todayEnd, true, true)
      .toArray();

    if (todayEvents.length === 0) {
      console.log('No events today, skipping daily summary');
      return;
    }

    // Sort by start time
    todayEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Format event list
    const eventList = todayEvents
      .map((event) => {
        const time = new Date(event.start).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const category = event.category ? `[${event.category}]` : '';
        return `${time} ${category} ${event.title}`;
      })
      .join('\n');

    // Send notification
    await sendNotification({
      title: `Good morning! You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today`,
      body: eventList,
      tag: 'daily-summary',
      data: {
        eventId: 'daily-summary',
        action: 'open-calendar',
      },
    });

    // Mark as sent
    localStorage.setItem('lastDailySummaryDate', today);
    console.log('Daily summary sent');
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}
```

**Update src/App.tsx to start daily summary scheduler:**
```typescript
import { startDailySummaryScheduler, stopDailySummaryScheduler } from '@/services/dailySummaryService';

useEffect(() => {
  startReminderScheduler();
  startDailySummaryScheduler(); // Add this

  return () => {
    stopReminderScheduler();
    stopDailySummaryScheduler(); // Add this
  };
}, []);
```

**Add user setting to toggle daily summary (optional, for user preferences):**

**src/components/Settings/SettingsPanel.tsx:**
```typescript
const [dailySummaryEnabled, setDailySummaryEnabled] = useState(() => 
  localStorage.getItem('dailySummaryEnabled') !== 'false'
);

function handleToggleDailySummary(enabled: boolean) {
  setDailySummaryEnabled(enabled);
  localStorage.setItem('dailySummaryEnabled', enabled.toString());
}

// In JSX
<div className="flex items-center justify-between">
  <Label>Daily Morning Summary (08:00)</Label>
  <input
    type="checkbox"
    checked={dailySummaryEnabled}
    onChange={(e) => handleToggleDailySummary(e.target.checked)}
  />
</div>
```

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
- [ ] **Daily summary sends at 08:00** (test by changing time check)
- [ ] **Daily summary lists all today's events** with times and categories
- [ ] **Daily summary only sends once per day** (localStorage flag works)
- [ ] **User can disable daily summary** in settings
- [ ] **Daily summary doesn't send** if no events today

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
- [ ] **Daily summary notification sent at 08:00 every morning**
- [ ] **Summary includes event count, times, and categories**
- [ ] **User can enable/disable daily summary** in settings
- [ ] **Daily summary skipped** if no events scheduled for today

---

## Known Limitations

- **Browser closed completely:** Service worker may not run, notifications may not fire (platform-dependent)
- **iOS Safari PWA:** Background notifications have limited support
- **Single reminder per event:** MVP supports only one reminder time (future: multiple reminders)
- [ **No snooze:** Users cannot snooze notifications (future enhancement)
- **Fixed daily summary time (08:00):** MVP doesn't support custom summary times (post-MVP feature)
- **No daily summary customization:** MVP sends all events, no filtering by category/priority (post-MVP)

---

## Next Phase

Proceed to **Phase 8: Conflict Detection & Validation**
