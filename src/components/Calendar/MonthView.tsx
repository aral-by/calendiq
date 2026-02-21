import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (eventId: string) => void;
}

export function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function getEventsForDay(date: Date) {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, date);
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="p-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={cn(
                "border-r border-b p-2 min-h-[100px] cursor-pointer transition-colors hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isCurrentDay && "bg-accent/30"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay && "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event.id);
                    }}
                    className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: event.categoryColor || event.color || '#6366f1',
                      color: 'white'
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
