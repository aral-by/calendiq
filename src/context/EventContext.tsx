import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CalendarEvent } from '@/types/event';
import { IndexedDBEventRepository } from '@/db/repositories';
import { eventAPI } from '@/services/eventApi';

interface EventContextValue {
  events: CalendarEvent[];
  loading: boolean;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  createEventWithAI: (prompt: string) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => CalendarEvent | undefined;
  refreshEvents: () => Promise<void>;
  syncWithAPI: () => Promise<void>;
  isOnline: boolean;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const eventRepo = new IndexedDBEventRepository();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[Events] Back online - syncing...');
      syncWithAPI();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Events] Offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      // 1. Create locally first (offline-first approach)
      const newEvent = await eventRepo.create(event);
      setEvents([...events, newEvent]);
      console.log('[Events] Created event locally:', newEvent.id);

      // 2. Sync to API if online (background)
      if (isOnline) {
        try {
          await eventAPI.create(event);
          console.log('[Events] Synced to API:', newEvent.id);
        } catch (apiError) {
          console.warn('[Events] API sync failed (local copy saved):', apiError);
          // Event is still saved locally - this is OK
        }
      }

      return newEvent;
    } catch (error) {
      console.error('[Events] Error creating event:', error);
      throw error;
    }
  }

  async function createEventWithAI(prompt: string) {
    try {
      if (!isOnline) {
        throw new Error('AI features require internet connection');
      }

      console.log('[Events] Creating event with AI:', prompt);
      
      // Call AI endpoint
      const { event: aiEvent } = await eventAPI.createWithAI(prompt);
      
      // Save to IndexedDB
      const newEvent = await eventRepo.create(aiEvent);
      setEvents([...events, newEvent]);
      
      console.log('[Events] AI event created:', newEvent.id);
      return newEvent;
    } catch (error) {
      console.error('[Events] Error creating AI event:', error);
      throw error;
    }
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    try {
      // 1. Update locally first
      const updated = await eventRepo.update(id, updates);
      setEvents(events.map(e => e.id === id ? updated : e));
      console.log('[Events] Updated event locally:', id);

      // 2. Sync to API if online
      if (isOnline) {
        try {
          await eventAPI.update(id, updates);
          console.log('[Events] Synced update to API:', id);
        } catch (apiError) {
          console.warn('[Events] API sync failed (local copy updated):', apiError);
        }
      }

      return updated;
    } catch (error) {
      console.error('[Events] Error updating event:', error);
      throw error;
    }
  }

  async function deleteEvent(id: string) {
    try {
      // 1. Delete locally first
      await eventRepo.delete(id);
      setEvents(events.filter(e => e.id !== id));
      console.log('[Events] Deleted event locally:', id);

      // 2. Sync to API if online
      if (isOnline) {
        try {
          await eventAPI.delete(id);
          console.log('[Events] Synced delete to API:', id);
        } catch (apiError) {
          console.warn('[Events] API sync failed (local copy deleted):', apiError);
        }
      }
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

  async function syncWithAPI() {
    if (!isOnline) {
      console.log('[Events] Cannot sync - offline');
      return;
    }

    try {
      console.log('[Events] Syncing with API...');
      
      // For now, just fetch from API to test connection
      // In production, implement proper bidirectional sync
      const apiHealth = await eventAPI.healthCheck();
      
      if (apiHealth) {
        console.log('[Events] API connection healthy');
        // TODO: Implement full sync logic
        // - Compare local vs API events
        // - Resolve conflicts
        // - Push local changes
        // - Pull API changes
      } else {
        console.warn('[Events] API not available');
      }
    } catch (error) {
      console.error('[Events] Sync failed:', error);
    }
  }

  return (
    <EventContext.Provider 
      value={{ 
        events, 
        loading, 
        createEvent,
        createEventWithAI,
        updateEvent, 
        deleteEvent, 
        getEventById,
        refreshEvents,
        syncWithAPI,
        isOnline
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
