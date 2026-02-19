# Phase 4: Calendar UI & Manual CRUD

**Status:** Not Started  
**Estimated Time:** 4-5 hours  
**Dependencies:** Phase 3

---

## Objectives

- Integrate FullCalendar library
- Create two-column tablet layout
- Build event creation modal
- Implement manual event CRUD operations
- Add event conflict detection

---

## Tasks

### 4.1 Install FullCalendar

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

---

### 4.2 Create Main Layout

**src/components/Layout/MainLayout.tsx:**
```typescript
import { ReactNode } from 'react';

interface MainLayoutProps {
  calendar: ReactNode;
  chat: ReactNode;
}

export function MainLayout({ calendar, chat }: MainLayoutProps) {
  return (
    <div className="h-screen flex">
      <div className="w-[65%] p-4 border-r">
        {calendar}
      </div>
      <div className="w-[35%] p-4">
        {chat}
      </div>
    </div>
  );
}
```

---

### 4.3 Create Event Context

**src/context/EventContext.tsx:**
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CalendarEvent } from '@/types/event';
import { IndexedDBEventRepository } from '@/db/repositories';

interface EventContextValue {
  events: CalendarEvent[];
  loading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const eventRepo = new IndexedDBEventRepository();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const allEvents = await eventRepo.getAll();
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    const newEvent = await eventRepo.create(event);
    setEvents([...events, newEvent]);
    return newEvent;
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    const updated = await eventRepo.update(id, updates);
    setEvents(events.map(e => e.id === id ? updated : e));
    return updated;
  }

  async function deleteEvent(id: string) {
    await eventRepo.delete(id);
    setEvents(events.filter(e => e.id !== id));
  }

  async function refreshEvents() {
    await loadEvents();
  }

  return (
    <EventContext.Provider value={{ events, loading, createEvent, updateEvent, deleteEvent, refreshEvents }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvents must be used within EventProvider');
  return context;
}
```

---

### 4.4 Create Calendar View

**src/components/Calendar/CalendarView.tsx:**
```typescript
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from '@/context/EventContext';
import { useState } from 'react';
import { EventModal } from './EventModal';

export function CalendarView() {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);

  function handleEventClick(info: any) {
    setSelectedEvent(info.event.id);
    setModalOpen(true);
  }

  function handleDateClick(info: any) {
    setNewEventDate(info.date);
    setSelectedEvent(null);
    setModalOpen(true);
  }

  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay'
        }}
        events={events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          backgroundColor: e.color
        }))}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="100%"
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
      />
      
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={selectedEvent}
        initialDate={newEventDate}
      />
    </>
  );
}
```

---

### 4.5 Create Event Modal

**src/components/Calendar/EventModal.tsx:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventForm } from './EventForm';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  eventId?: string | null;
  initialDate?: Date | null;
}

export function EventModal({ open, onClose, eventId, initialDate }: EventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{eventId ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <EventForm eventId={eventId} initialDate={initialDate} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4.6 Create Event Form

**src/components/Calendar/EventForm.tsx:**
```typescript
import { useState, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// ... (full form implementation with all fields)

export function EventForm({ eventId, initialDate, onSuccess }: EventFormProps) {
  // Form state and handlers
  // Validation
  // Conflict detection
  // Submit logic
}
```

---

### 4.7 Create Conflict Detection Hook

**src/hooks/useConflictDetection.ts:**
```typescript
import { useEvents } from '@/context/EventContext';
import { isOverlapping } from '@/lib/dateUtils';

export function useConflictDetection() {
  const { events } = useEvents();

  function detectConflicts(
    start: string,
    end: string,
    excludeId?: string
  ): CalendarEvent[] {
    return events.filter(event => {
      if (excludeId && event.id === excludeId) return false;
      return isOverlapping(start, end, event.start, event.end);
    });
  }

  return { detectConflicts };
}
```

---

### 4.8 Add Multiple Calendar Views

Update FullCalendar to support multiple view types.

**Required Plugins:**
```bash
npm install @fullcalendar/daygrid @fullcalendar/list
```

**src/components/Calendar/CalendarView.tsx (update):**
```typescript
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useEvents } from '@/context/EventContext';
import { useState } from 'react';

export function CalendarView() {
  const { events } = useEvents();
  const [currentView, setCurrentView] = useState('timeGridWeek');

  return (
    <>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin
        ]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        views={{
          timeGridWeek: { buttonText: 'Week' },
          timeGridDay: { buttonText: 'Day' },
          dayGridMonth: { buttonText: 'Month' },
          listWeek: { buttonText: 'List' }
        }}
        viewDidMount={(info) => setCurrentView(info.view.type)}
        events={events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          backgroundColor: e.categoryColor || e.color
        }))}
        // ... rest of config
      />
    </>
  );
}
```

**View Keyboard Shortcuts (optional):**
```typescript
useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case '1': calendarRef.current?.getApi().changeView('timeGridDay'); break;
        case '2': calendarRef.current?.getApi().changeView('timeGridWeek'); break;
        case '3': calendarRef.current?.getApi().changeView('dayGridMonth'); break;
        case '4': calendarRef.current?.getApi().changeView('listWeek'); break;
      }
    }
  }
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Persist User View Preference:**
```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('preferredCalendarView', currentView);
}, [currentView]);

// Load on mount
const [initialView] = useState(() => 
  localStorage.getItem('preferredCalendarView') || 'timeGridWeek'
);
```

---

## Acceptance Criteria

- [ ] FullCalendar displays in week view
- [ ] Events render on calendar
- [ ] Click on date opens new event modal
- [ ] Click on event opens edit modal
- [ ] Event form has all required fields
- [ ] Create event saves to IndexedDB
- [ ] Update event persists changes
- [ ] Delete event removes from DB and UI
- [ ] Conflict detection warns user
- [ ] Layout is 65/35 split
- [ ] **5 calendar views available** (Week, Day, Month, List, Timeline optional)
- [ ] **View switcher in header toolbar**
- [ ] **Keyboard shortcuts work** (Ctrl+1/2/3/4)
- [ ] **User view preference persists** across sessions
- [ ] **Category colors display** in all views

---

## Next Phase

Proceed to **Phase 5: Chat Interface & AI Integration**
