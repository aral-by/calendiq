import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDialog({ open, onOpenChange }: NotificationDialogProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [open]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser doesn\'t support notifications');
      return;
    }

    setIsRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Register service worker for notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        }
        
        // Show a test notification
        new Notification('Calendiq Notifications Enabled! 🎉', {
          body: 'You\'ll now receive notifications for your important events.',
          icon: '/logo.png',
        });
        
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return {
          title: 'Notifications Enabled',
          description: 'Calendiq notifications are enabled.',
          icon: <Check className="h-12 w-12 text-green-500" />,
          color: 'bg-green-50 dark:bg-green-950',
        };
      case 'denied':
        return {
          title: 'Notifications Blocked',
          description: 'You need to grant permission from browser settings to enable notifications.',
          icon: <X className="h-12 w-12 text-red-500" />,
          color: 'bg-red-50 dark:bg-red-950',
        };
      default:
        return {
          title: 'Enable Notifications',
          description: 'Would you like to receive timely reminders for your events?',
          icon: <Bell className="h-12 w-12 text-blue-500" />,
          color: 'bg-blue-50 dark:bg-blue-950',
        };
    }
  };

  const status = getPermissionStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${status.color}`}>
            {status.icon}
          </div>
          <DialogTitle className="text-center text-xl">{status.title}</DialogTitle>
          <DialogDescription className="text-center">
            {status.description}
          </DialogDescription>
        </DialogHeader>
        
        {notificationPermission === 'default' && (
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={requestPermission}
              disabled={isRequesting}
              className="w-full"
            >
              {isRequesting ? 'Requesting Permission...' : 'Enable Notifications'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Not Now
            </Button>
          </DialogFooter>
        )}
        
        {notificationPermission === 'granted' && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        )}
        
        {notificationPermission === 'denied' && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Got It
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
