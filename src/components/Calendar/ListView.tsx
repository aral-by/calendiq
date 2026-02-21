import { useState } from 'react';
import { format, isToday, isPast, isTomorrow, isThisWeek } from 'date-fns';
import type { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import { Calendar, Clock, MapPin, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ListViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
}

export function ListView({ events, onEventClick }: ListViewProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Helper function to get smart date group label
  const getDateGroupLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date, { weekStartsOn: 1 })) return 'This Week';
    if (isPast(date)) return 'Past';
    return 'Later';
  };

  // Group events by smart categories
  const smartGroups = events.reduce((acc, event) => {
    const eventDate = format(new Date(event.start), 'yyyy-MM-dd');
    const date = new Date(event.start);
    const groupLabel = getDateGroupLabel(date);
    
    if (!acc[groupLabel]) {
      acc[groupLabel] = {};
    }
    if (!acc[groupLabel][eventDate]) {
      acc[groupLabel][eventDate] = [];
    }
    acc[groupLabel][eventDate].push(event);
    return acc;
  }, {} as Record<string, Record<string, CalendarEvent[]>>);

  // Define group order
  const groupOrder = ['Today', 'Tomorrow', 'This Week', 'Later', 'Past'];
  const orderedGroups = groupOrder.filter(group => smartGroups[group]);

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
    <div className="flex flex-col h-full overflow-auto p-4 sm:p-6">
      <div className="space-y-8 max-w-4xl mx-auto w-full">
        {orderedGroups.map(groupLabel => {
          const groupDates = Object.keys(smartGroups[groupLabel]).sort();
          const isPastGroup = groupLabel === 'Past';
          
          return (
            <div key={groupLabel} className={cn("space-y-4", isPastGroup && "opacity-60")}>
              {/* Smart Group Header */}
              <div className="flex items-center gap-3">
                <h2 className={cn(
                  "text-lg font-bold",
                  groupLabel === 'Today' && "text-primary"
                )}>
                  {groupLabel}
                </h2>
                {groupLabel === 'Today' && (
                  <Badge className="bg-primary">
                    {groupDates.reduce((count, date) => count + smartGroups[groupLabel][date].length, 0)} events
                  </Badge>
                )}
              </div>
              
              <Separator />

              {/* Events grouped by date */}
              <div className="space-y-6">
                {groupDates.map(dateStr => {
                  const date = new Date(dateStr);
                  const dayEvents = smartGroups[groupLabel][dateStr];
                  const isCurrentDay = isToday(date);
                  
                  return (
                    <div key={dateStr} className="space-y-3">
                      {/* Date subheader (only if not Today group or multiple dates) */}
                      {(groupLabel !== 'Today' && groupLabel !== 'Tomorrow') && (
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "text-sm font-semibold",
                            isCurrentDay && "text-primary"
                          )}>
                            {format(date, 'EEE, MMM d')}
                          </h3>
                        </div>
                      )}

                      {/* Events list */}
                      <div className="space-y-2">
                        {dayEvents
                          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                          .map(event => {
                            const isExpanded = expandedEventId === event.id;
                            
                            return (
                              <Card 
                                key={event.id}
                                className={cn(
                                  "cursor-pointer transition-all hover:shadow-md border-l-4",
                                  isExpanded && "shadow-lg"
                                )}
                                style={{
                                  borderLeftColor: event.categoryColor || event.color || '#6366f1'
                                }}
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedEventId(null);
                                  } else {
                                    setExpandedEventId(event.id);
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  {/* Compact view */}
                                  <div className="flex items-center gap-3">
                                    {/* Color dot */}
                                    <div 
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: event.categoryColor || event.color || '#6366f1' }}
                                    />
                                    
                                    {/* Time */}
                                    <div className="text-sm font-medium text-muted-foreground w-16 flex-shrink-0">
                                      {event.allDay ? 'All day' : format(new Date(event.start), 'HH:mm')}
                                    </div>
                                    
                                    {/* Title */}
                                    <div className="flex-1 font-semibold text-sm truncate">
                                      {event.title}
                                    </div>
                                    
                                    {/* Location icon */}
                                    {event.location && (
                                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                                    )}

                                    {/* Status badge */}
                                    {event.status && event.status !== 'confirmed' && (
                                      <Badge 
                                        variant={event.status === 'cancelled' ? 'destructive' : 'secondary'}
                                        className="text-xs flex-shrink-0"
                                      >
                                        {event.status}
                                      </Badge>
                                    )}
                                    
                                    {/* Expand icon */}
                                    <ChevronDown 
                                      className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                                        isExpanded && "rotate-180"
                                      )}
                                    />
                                  </div>

                                  {/* Expanded details */}
                                  {isExpanded && (
                                    <div 
                                      className="mt-3 pt-3 border-t space-y-2 animate-in fade-in-50 slide-in-from-top-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick(event.id);
                                      }}
                                    >
                                      {/* Time range */}
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {event.allDay ? (
                                          <span>All day event</span>
                                        ) : (
                                          <span>
                                            {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end || event.start), 'HH:mm')}
                                          </span>
                                        )}
                                      </div>

                                      {/* Location */}
                                      {event.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <MapPin className="h-4 w-4" />
                                          <span>{event.location}</span>
                                        </div>
                                      )}

                                      {/* Description */}
                                      {event.description && (
                                        <p className="text-sm text-muted-foreground">
                                          {event.description}
                                        </p>
                                      )}

                                      {/* Tags */}
                                      {event.tags && event.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {event.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}

                                      {/* Click to edit hint */}
                                      <div className="text-xs text-muted-foreground/60 italic pt-1">
                                        Click to edit event
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
