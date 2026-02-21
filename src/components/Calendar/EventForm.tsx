import { useState, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DEFAULT_CATEGORIES, REMINDER_OPTIONS } from '@/types/event';
import type { CalendarEvent, EventCategory, EventStatus } from '@/types/event';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { AlertTriangle, Trash2, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EventFormProps {
  eventId?: string;
  initialStart?: Date;
  onSuccess: () => void;
}

export function EventForm({ eventId, initialStart, onSuccess }: EventFormProps) {
  const { createEvent, updateEvent, deleteEvent, getEventById } = useEvents();
  const { detectConflicts } = useConflictDetection();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('personal');
  const [status, setStatus] = useState<EventStatus>('confirmed');
  const [reminder, setReminder] = useState<number>(15);
  const [color, setColor] = useState('');

  // Helper to combine date and time into ISO string
  const combineDateTime = (date: Date | undefined, time: string): string => {
    if (!date) return '';
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString().slice(0, 16);
  };

  // Helper to extract date and time from ISO string
  const extractDateTime = (isoString: string): { date: Date; time: string } => {
    const date = new Date(isoString);
    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return { date, time };
  };

  // Load event data if editing
  useEffect(() => {
    if (eventId) {
      const event = getEventById(eventId);
      if (event) {
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        
        const { date: sDate, time: sTime } = extractDateTime(event.start);
        setStartDate(sDate);
        setStartTime(sTime);
        
        const { date: eDate, time: eTime } = extractDateTime(event.end || event.start);
        setEndDate(eDate);
        setEndTime(eTime);
        
        setAllDay(event.allDay || false);
        setCategory(event.category || 'personal');
        setStatus(event.status || 'confirmed');
        setReminder(event.reminder || 15);
        setColor(event.color || '');
      }
    } else if (initialStart) {
      // Set initial times for new event
      const startDateTime = new Date(initialStart);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);
      
      const { date: sDate, time: sTime } = extractDateTime(startDateTime.toISOString());
      setStartDate(sDate);
      setStartTime(sTime);
      
      const { date: eDate, time: eTime } = extractDateTime(endDateTime.toISOString());
      setEndDate(eDate);
      setEndTime(eTime);
    }
  }, [eventId, initialStart, getEventById]);

  // Check for conflicts when times change
  useEffect(() => {
    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);
    if (start && end) {
      const foundConflicts = detectConflicts(start, end, eventId);
      setConflicts(foundConflicts);
    }
  }, [startDate, startTime, endDate, endTime, eventId, detectConflicts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!startDate) {
      setError('Start date is required');
      return;
    }

    if (!endDate) {
      setError('End date is required');
      return;
    }

    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);

    if (new Date(end) <= new Date(start)) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const categoryDef = DEFAULT_CATEGORIES.find(c => c.id === category);
      
      const eventData = {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start,
        end,
        allDay,
        category,
        categoryColor: categoryDef?.color,
        status,
        reminder,
        color: color || categoryDef?.color,
        notificationSent: false,
      };

      if (eventId) {
        await updateEvent(eventId, eventData);
      } else {
        await createEvent(eventData);
      }

      onSuccess();
    } catch (err) {
      console.error('[EventForm] Error:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!eventId) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        await deleteEvent(eventId);
        onSuccess();
      } catch (err) {
        console.error('[EventForm] Delete error:', err);
        setError('Failed to delete event');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          required
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details"
          className="min-h-[80px] resize-none"
          disabled={loading}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Location
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Add location"
          disabled={loading}
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date & Time */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Start Date & Time *
          </Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="relative w-28">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        {/* End Date & Time */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            End Date & Time *
          </Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="relative w-28">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center gap-3">
        <input
          id="allDay"
          type="checkbox"
          checked={allDay}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllDay(e.target.checked)}
          className="w-4 h-4 rounded border-input"
          disabled={loading}
        />
        <Label htmlFor="allDay" className="text-sm font-normal">
          All day event
        </Label>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <Select value={category} onValueChange={(val) => setCategory(val as EventCategory)} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reminder */}
      <div className="space-y-2">
        <Label htmlFor="reminder" className="text-sm font-medium">
          Reminder
        </Label>
        <Select value={reminder.toString()} onValueChange={(val) => setReminder(Number(val))} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REMINDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          Status
        </Label>
        <Select value={status} onValueChange={(val) => setStatus(val as EventStatus)} disabled={loading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="tentative">Tentative</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription>
            This event conflicts with {conflicts.length} other event{conflicts.length > 1 ? 's' : ''}:
            <ul className="mt-2 ml-4 list-disc text-sm">
              {conflicts.map(c => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        {eventId && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="gap-2 sm:mr-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete Event
          </Button>
        )}
        
        <div className="flex gap-3 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Saving...' : eventId ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </div>
    </form>
  );
}
