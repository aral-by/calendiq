import { useState, useEffect } from 'react';
import { useEvents } from '@/context/EventContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DEFAULT_CATEGORIES, REMINDER_OPTIONS } from '@/types/event';
import type { CalendarEvent, EventCategory, EventStatus } from '@/types/event';
import { useConflictDetection } from '@/hooks/useConflictDetection';
import { AlertTriangle, Trash2 } from 'lucide-react';

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
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('personal');
  const [status, setStatus] = useState<EventStatus>('confirmed');
  const [reminder, setReminder] = useState<number>(15);
  const [color, setColor] = useState('');

  // Load event data if editing
  useEffect(() => {
    if (eventId) {
      const event = getEventById(eventId);
      if (event) {
        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location || '');
        setStart(event.start);
        setEnd(event.end || event.start);
        setAllDay(event.allDay || false);
        setCategory(event.category || 'personal');
        setStatus(event.status || 'confirmed');
        setReminder(event.reminder || 15);
        setColor(event.color || '');
      }
    } else if (initialStart) {
      // Set initial times for new event
      const startDate = new Date(initialStart);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      
      setStart(startDate.toISOString().slice(0, 16));
      setEnd(endDate.toISOString().slice(0, 16));
    }
  }, [eventId, initialStart, getEventById]);

  // Check for conflicts when times change
  useEffect(() => {
    if (start && end) {
      const foundConflicts = detectConflicts(start, end, eventId);
      setConflicts(foundConflicts);
    }
  }, [start, end, eventId, detectConflicts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!start) {
      setError('Start time is required');
      return;
    }

    if (!end) {
      setError('End time is required');
      return;
    }

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
        <Label htmlFor="title" className="text-sm uppercase tracking-wider text-gray-600">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="text-lg border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900"
          required
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm uppercase tracking-wider text-gray-600">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details"
          className="border-gray-200 rounded-lg min-h-[80px] resize-none"
          disabled={loading}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm uppercase tracking-wider text-gray-600">
          Location
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Add location"
          className="border-gray-200 rounded-lg"
          disabled={loading}
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start" className="text-sm uppercase tracking-wider text-gray-600">
            Start
          </Label>
          <Input
            id="start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border-gray-200 rounded-lg"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end" className="text-sm uppercase tracking-wider text-gray-600">
            End
          </Label>
          <Input
            id="end"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border-gray-200 rounded-lg"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center gap-3">
        <input
          id="allDay"
          type="checkbox"
          checked={allDay}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAllDay(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
          disabled={loading}
        />
        <Label htmlFor="allDay" className="text-sm text-gray-600">
          All day event
        </Label>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm uppercase tracking-wider text-gray-600">
          Category
        </Label>
        <Select value={category} onValueChange={(val) => setCategory(val as EventCategory)} disabled={loading}>
          <SelectTrigger className="border-gray-200 rounded-lg">
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
        <Label htmlFor="reminder" className="text-sm uppercase tracking-wider text-gray-600">
          Reminder
        </Label>
        <Select value={reminder.toString()} onValueChange={(val) => setReminder(Number(val))} disabled={loading}>
          <SelectTrigger className="border-gray-200 rounded-lg">
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
        <Label htmlFor="status" className="text-sm uppercase tracking-wider text-gray-600">
          Status
        </Label>
        <Select value={status} onValueChange={(val) => setStatus(val as EventStatus)} disabled={loading}>
          <SelectTrigger className="border-gray-200 rounded-lg">
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
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
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
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t">
        {eventId && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
        
        <div className="ml-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {loading ? 'Saving...' : eventId ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  );
}
