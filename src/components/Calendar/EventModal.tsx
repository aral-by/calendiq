import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">
            {eventId ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto scrollbar-hide px-6 pb-6">
          <EventForm 
            eventId={eventId || undefined} 
            initialStart={initialStart || undefined} 
            onSuccess={onClose} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
