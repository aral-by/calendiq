import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/animate-ui/components/radix/dialog';
import { EventForm } from './EventForm';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  eventId?: string | null;
  initialStart?: Date | null;
}

export function EventModal({ open, onClose, eventId, initialStart }: EventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" from="bottom">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-tight">
            {eventId ? 'Edit Event' : 'New Event'}
          </DialogTitle>
        </DialogHeader>
        <EventForm 
          eventId={eventId || undefined} 
          initialStart={initialStart || undefined} 
          onSuccess={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
}
