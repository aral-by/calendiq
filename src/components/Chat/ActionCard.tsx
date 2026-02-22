import { CheckCircle2, AlertCircle, Clock, MapPin, Tag, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarEvent } from '@/types/event';
import { cn } from '@/lib/utils';

type ActionCardType = 'creating' | 'created' | 'updating' | 'updated' | 'deleting' | 'deleted' | 'conflict' | 'querying';

interface ActionCardProps {
  type: ActionCardType;
  event?: Partial<CalendarEvent>;
  conflictingEvents?: CalendarEvent[];
}

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'work':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'personal':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'health':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'social':
      return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
    case 'finance':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'education':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
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

export function ActionCard({ type, event, conflictingEvents }: ActionCardProps) {
  // Loading states
  if (type === 'creating' || type === 'updating' || type === 'deleting' || type === 'querying') {
    const loadingMessages = {
      creating: 'Takvime ekleniyor',
      updating: 'Güncelleniyor',
      deleting: 'Siliniyor',
      querying: 'Aranıyor',
    };

    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="shrink-0 mt-0.5">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{loadingMessages[type]}...</p>
        </div>
      </div>
    );
  }

  // Success states
  if (type === 'created' || type === 'updated' || type === 'deleted') {
    const successMessages = {
      created: 'Etkinlik eklendi!',
      updated: 'Etkinlik güncellendi!',
      deleted: 'Etkinlik silindi!',
    };

    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {successMessages[type]}
          </p>
          
          {event && type !== 'deleted' && (
            <div className="space-y-2.5 pt-2 border-t border-green-500/10">
              {/* Başlık */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{event.title}</p>
                </div>
              </div>

              {/* Tarih & Saat */}
              {event.start && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start), "d MMMM yyyy, EEEE", { locale: tr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.allDay 
                        ? 'Tüm gün' 
                        : `${format(new Date(event.start), 'HH:mm')} - ${event.end ? format(new Date(event.end), 'HH:mm') : ''}`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Konum */}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              )}

              {/* Kategori */}
              {event.category && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    getCategoryColor(event.category)
                  )}>
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
              )}

              {/* Açıklama */}
              {event.description && (
                <p className="text-sm text-muted-foreground pt-1 border-t border-green-500/10">
                  {event.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Conflict state
  if (type === 'conflict' && conflictingEvents && conflictingEvents.length > 0) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Çakışma tespit edildi!
          </p>
          
          <div className="space-y-2 pt-2 border-t border-orange-500/10">
            <p className="text-xs text-muted-foreground">
              Bu saatte {conflictingEvents.length} etkinlik var:
            </p>
            {conflictingEvents.map((conflictEvent) => (
              <div key={conflictEvent.id} className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
                <Calendar className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{conflictEvent.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(conflictEvent.start), 'HH:mm')} - {format(new Date(conflictEvent.end), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
