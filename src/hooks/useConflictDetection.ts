import { useEvents } from '@/context/EventContext';
import { isOverlapping } from '@/lib/dateUtils';
import type { CalendarEvent } from '@/types/event';

interface ConflictDetection {
  detectConflicts: (start: string, end: string, excludeId?: string) => CalendarEvent[];
  hasConflict: (start: string, end: string, excludeId?: string) => boolean;
}

export function useConflictDetection(): ConflictDetection {
  const { events } = useEvents();

  function detectConflicts(
    start: string,
    end: string,
    excludeId?: string
  ): CalendarEvent[] {
    return events.filter(event => {
      // Skip the event being edited
      if (excludeId && event.id === excludeId) {
        return false;
      }
      
      // Skip cancelled events
      if (event.status === 'cancelled') {
        return false;
      }
      
      // Check for overlap
      return isOverlapping(start, end, event.start, event.end || event.start);
    });
  }

  function hasConflict(start: string, end: string, excludeId?: string): boolean {
    return detectConflicts(start, end, excludeId).length > 0;
  }

  return { detectConflicts, hasConflict };
}
