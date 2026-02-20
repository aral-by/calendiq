import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CalendarEvent } from '@/types/event';
import { IndexedDBEventRepository } from '@/db/repositories';

interface EventContextValue {
  events: CalendarEvent[];
  loading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => CalendarEvent | undefined;
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
      setLoading(true);
      const allEvents = await eventRepo.getAll();
      setEvents(allEvents);
      console.log('[Events] Loaded', allEvents.length, 'events');
    } catch (error) {
      console.error('[Events] Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const newEvent = await eventRepo.create(event);
      setEvents([...events, newEvent]);
      console.log('[Events] Created event:', newEvent.id);
      return newEvent;
    } catch (error) {
      console.error('[Events] Error creating event:', error);
      throw error;
    }
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    try {
      const updated = await eventRepo.update(id, updates);
      setEvents(events.map(e => e.id === id ? updated : e));
      console.log('[Events] Updated event:', id);
      return updated;
    } catch (error) {
      console.error('[Events] Error updating event:', error);
      throw error;
    }
  }

  async function deleteEvent(id: string) {
    try {
      await eventRepo.delete(id);
      setEvents(events.filter(e => e.id !== id));
      console.log('[Events] Deleted event:', id);
    } catch (error) {
      console.error('[Events] Error deleting event:', error);
      throw error;
    }
  }

  function getEventById(id: string): CalendarEvent | undefined {
    return events.find(e => e.id === id);
  }

  async function refreshEvents() {
    await loadEvents();
  }

  return (
    <EventContext.Provider 
      value={{ 
        events, 
        loading, 
        createEvent, 
        updateEvent, 
        deleteEvent, 
        getEventById,
        refreshEvents 
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within EventProvider');
  }
  return context;
}
