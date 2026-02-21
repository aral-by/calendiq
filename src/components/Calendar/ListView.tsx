import { format, isToday, isFuture, isPast } from 'date-fns';
import type { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ListViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export function ListView({ currentDate, events, onEventClick }: ListViewProps) {
  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No events</h3>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Click the "New Event" button to create your first event
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-6">
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        {sortedDates.map(dateStr => {
          const date = new Date(dateStr);
          const dayEvents = groupedEvents[dateStr];
          const isToDoDay = isToday(date);
          const isFutureDay = isFuture(date);
          const isPastDay = isPast(date) && !isToday(date);
          
          return (
            <div key={dateStr} className="space-y-3">
              {/* Date header */}
              <div className={cn(
                "sticky top-0 bg-background py-2 border-b-2",
                isToDoday && "border-primary",
                isFutureDay && "border-blue-500/30",
                isPastDay && "border-muted"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "text-sm font-semibold uppercase tracking-wide",
                    isToday(date) && "text-primary"
                  )}>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </div>
                  {isToday(date) && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Events list */}
              <div className="space-y-2">
                {dayEvents
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event.id)}
                      className={cn(
                        "group border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                        "hover:border-primary/50"
                      )}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: event.categoryColor || event.color || '#6366f1'
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Title */}
                          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>

                          {/* Time and location */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {event.allDay ? (
                                <span>All day</span>
                              ) : (
                                <span>
                                  {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                </span>
                              )}
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          {/* Tags */}
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {event.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="text-xs bg-muted px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status badge */}
                        {event.status && event.status !== 'confirmed' && (
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            event.status === 'cancelled' && "bg-destructive/10 text-destructive",
                            event.status === 'tentative' && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
                          )}>
                            {event.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
