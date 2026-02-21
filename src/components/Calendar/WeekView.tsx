import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isToday,
  isSameDay,
  addHours,
  setHours,
  setMinutes
} from 'date-fns';
import type { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

export function WeekView({ currentDate, events, onTimeSlotClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

  function getEventsForDayAndHour(date: Date, hour: number) {
    return events.filter(event => {
      if (event.allDay) return false;
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return isSameDay(eventStart, date) && eventHour === hour;
    });
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
        <div className="p-3 border-r bg-muted/50" /> {/* Time column header */}
        {days.map(day => {
          const isCurrentDay = isToday(day);
          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "p-3 text-center border-r",
                isCurrentDay ? "bg-accent text-accent-foreground font-semibold" : "bg-muted/50"
              )}
            >
              <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
              <div className={cn(
                "text-lg font-semibold",
                isCurrentDay && "bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
            {/* Time label */}
            <div className="p-2 border-r bg-muted/30 text-xs text-muted-foreground text-right pr-3">
              {format(setHours(new Date(), hour), 'HH:mm')}
            </div>
            
            {/* Day columns */}
            {days.map(day => {
              const timeSlot = setHours(setMinutes(day, 0), hour);
              const slotEvents = getEventsForDayAndHour(day, hour);
              
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  onClick={() => onTimeSlotClick(timeSlot)}
                  className="border-r p-1 hover:bg-accent/30 cursor-pointer transition-colors relative"
                >
                  {slotEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                      className="text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: event.categoryColor || event.color || '#6366f1',
                        color: 'white'
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-[10px] opacity-90">
                        {format(new Date(event.start), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
