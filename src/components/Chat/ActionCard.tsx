import { AlertCircle, Clock, MapPin, Tag, Calendar, Trash2, Edit3, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type ActionCardType = 'creating' | 'created' | 'updating' | 'updated' | 'deleting' | 'deleted' | 'bulk_updating' | 'bulk_updated' | 'bulk_deleting' | 'bulk_deleted' | 'conflict' | 'querying';

interface ActionCardProps {
  type: ActionCardType;
  event?: Partial<CalendarEvent>;
  events?: Partial<CalendarEvent>[]; // For bulk operations
  count?: number; // For bulk operations
  conflictingEvents?: CalendarEvent[];
}

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'work':
      return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'personal':
      return 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'health':
      return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    case 'social':
      return 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    case 'finance':
      return 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'education':
      return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    default:
      return 'bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
  }
};

const getCategoryLabel = (category?: string) => {
  switch (category) {
    case 'work':
      return 'İş';
    case 'personal':
      return 'Kişisel';
    case 'health':
      return 'Sağlık';
    case 'social':
      return 'Sosyal';
    case 'finance':
      return 'Finans';
    case 'education':
      return 'Eğitim';
    default:
      return 'Diğer';
  }
};

export function ActionCard({ type, event, events, count, conflictingEvents }: ActionCardProps) {
  // Loading states
  if (type === 'creating' || type === 'updating' || type === 'deleting' || type === 'querying' || type === 'bulk_updating' || type === 'bulk_deleting') {
    const loadingConfig = {
      creating: 'Ekleniyor',
      updating: 'Güncelleniyor',
      deleting: 'Siliniyor',
      querying: 'Aranıyor',
      bulk_updating: 'Güncelleniyor',
      bulk_deleting: 'Siliniyor',
    };

    return (
      <Card className="overflow-hidden border-l-4 border-l-slate-300 dark:border-l-slate-700 animate-in fade-in slide-in-from-left-3 duration-500">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              {loadingConfig[type]}...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Bulk success states
  if (type === 'bulk_updated' || type === 'bulk_deleted') {
    const config = {
      bulk_updated: {
        title: `${count} etkinlik güncellendi`,
        icon: Edit3,
        color: 'blue',
      },
      bulk_deleted: {
        title: `${count} etkinlik silindi`,
        icon: Trash2,
        color: 'rose',
      },
    };

    const current = config[type];

    return (
      <Card className={cn(
        "overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md",
        current.color === 'blue' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
        current.color === 'rose' && "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20",
        "animate-in fade-in slide-in-from-left-3 duration-500"
      )}>
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-1.5 rounded-lg",
              current.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
              current.color === 'rose' && "bg-rose-100 dark:bg-rose-900/30",
            )}>
              <current.icon className={cn(
                "w-4 h-4",
                current.color === 'blue' && "text-blue-600 dark:text-blue-400",
                current.color === 'rose' && "text-rose-600 dark:text-rose-400",
              )} />
            </div>
            <p className={cn(
              "text-sm font-medium",
              current.color === 'blue' && "text-blue-700 dark:text-blue-300",
              current.color === 'rose' && "text-rose-700 dark:text-rose-300",
            )}>
              {current.title}
            </p>
          </div>
          
          {/* Events List */}
          {events && events.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium text-muted-foreground">Etkilenen etkinlikler:</p>
              <div className="space-y-1">
                {events.slice(0, 5).map((evt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span>{evt.title}</span>
                  </div>
                ))}
                {events.length > 5 && (
                  <p className="text-xs text-muted-foreground/70 italic pl-3">
                    ... ve {events.length - 5} etkinlik daha
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Success states
  if (type === 'created' || type === 'updated' || type === 'deleted') {
    const config = {
      created: {
        title: 'Etkinlik eklendi',
        icon: CalendarPlus,
        color: 'emerald',
      },
      updated: {
        title: 'Etkinlik güncellendi',
        icon: Edit3,
        color: 'blue',
      },
      deleted: {
        title: 'Etkinlik silindi',
        icon: Trash2,
        color: 'rose',
      },
    };

    const current = config[type];

    return (
      <Card className={cn(
        "overflow-hidden border-l-4 transition-all duration-300 hover:shadow-md",
        current.color === 'emerald' && "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        current.color === 'blue' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
        current.color === 'rose' && "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20",
        "animate-in fade-in slide-in-from-left-3 duration-500"
      )}>
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "p-1.5 rounded-lg",
              current.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
              current.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
              current.color === 'rose' && "bg-rose-100 dark:bg-rose-900/30",
            )}>
              <current.icon className={cn(
                "w-4 h-4",
                current.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                current.color === 'blue' && "text-blue-600 dark:text-blue-400",
                current.color === 'rose' && "text-rose-600 dark:text-rose-400",
              )} />
            </div>
            <p className={cn(
              "text-sm font-medium",
              current.color === 'emerald' && "text-emerald-700 dark:text-emerald-300",
              current.color === 'blue' && "text-blue-700 dark:text-blue-300",
              current.color === 'rose' && "text-rose-700 dark:text-rose-300",
            )}>
              {current.title}
            </p>
          </div>

          {/* Event Details */}
          {event && (
            <div className="space-y-2.5 pt-1">
              {/* Başlık */}
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
              </div>

              {/* Tarih & Saat */}
              {event.start && type !== 'deleted' && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start), "d MMMM yyyy, EEEE", { locale: tr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.allDay 
                        ? 'Tüm gün' 
                        : `${format(new Date(event.start), 'HH:mm')}${event.end ? ` - ${format(new Date(event.end), 'HH:mm')}` : ''}`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Konum */}
              {event.location && type !== 'deleted' && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              )}

              {/* Kategori */}
              {event.category && type !== 'deleted' && (
                <div className="flex items-start gap-2.5">
                  <Tag className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-md font-medium border",
                    getCategoryColor(event.category)
                  )}>
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
              )}

              {/* Açıklama */}
              {event.description && type !== 'deleted' && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Conflict state
  if (type === 'conflict' && conflictingEvents && conflictingEvents.length > 0) {
    return (
      <Card className="overflow-hidden border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20 transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-3 duration-500">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Çakışma tespit edildi
            </p>
          </div>
          
          {/* Conflicting Events */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-medium text-muted-foreground">
              Bu saatte {conflictingEvents.length} etkinlik var:
            </p>
            <div className="space-y-2">
              {conflictingEvents.map((conflictEvent) => (
                <Card key={conflictEvent.id} className="bg-background/50">
                  <div className="p-3 flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium truncate">{conflictEvent.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(conflictEvent.start), 'HH:mm')} - {format(new Date(conflictEvent.end), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
