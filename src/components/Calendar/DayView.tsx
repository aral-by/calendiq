import { 
  format, 
  setHours,
  setMinutes,
  isSameDay
} from 'date-fns';
import type { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

export function DayView({ currentDate, events, onTimeSlotClick, onEventClick }: DayViewProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  function getEventsForHour(hour: number) {
    return events.filter(event => {
      if (event.allDay) return false;
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return isSameDay(eventStart, currentDate) && eventHour === hour;
    });
  }

  const allDayEvents = events.filter(event => event.allDay && isSameDay(new Date(event.start), currentDate));

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="border-b p-4 bg-muted/50 sticky top-0 z-10 bg-background">
        <div className="text-sm text-muted-foreground">{format(currentDate, 'EEEE')}</div>
        <div className="text-2xl font-bold">{format(currentDate, 'MMMM d, yyyy')}</div>
        
        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground font-medium">ALL DAY</div>
            {allDayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: event.categoryColor || event.color || '#6366f1',
                  color: 'white'
                }}
              >
                <div className="font-medium">{event.title}</div>
                {event.location && (
                  <div className="text-xs opacity-90 mt-1">📍 {event.location}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex-1">
        {hours.map(hour => {
          const timeSlot = setHours(setMinutes(currentDate, 0), hour);
          const hourEvents = getEventsForHour(hour);
          
          return (
            <div 
              key={hour} 
              className="grid grid-cols-[100px_1fr] border-b min-h-[80px]"
            >
              {/* Time label */}
              <div className="p-3 border-r bg-muted/30 text-sm text-muted-foreground text-right">
                {format(setHours(new Date(), hour), 'HH:mm')}
              </div>
              
              {/* Events */}
              <div
                onClick={() => onTimeSlotClick(timeSlot)}
                className="p-2 hover:bg-accent/30 cursor-pointer transition-colors"
              >
                <div className="space-y-2">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                      className="px-3 py-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: event.categoryColor || event.color || '#6366f1',
                        color: 'white'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                        </div>
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-90 mt-1">📍 {event.location}</div>
                      )}
                      {event.description && (
                        <div className="text-xs opacity-90 mt-1 line-clamp-2">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
