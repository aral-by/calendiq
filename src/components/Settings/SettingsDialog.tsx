import { useState, useEffect } from 'react';
import { Settings2, Globe, Palette, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';
import { useChatHistory } from '@/context/ChatHistoryContext';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, updateUser } = useUser();
  const { sessions, deleteAllSessions } = useChatHistory();
  const [language, setLanguage] = useState('en');
  const [preferredTheme, setPreferredTheme] = useState('system');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user && open) {
      setLanguage(user.preferredLanguage || 'en');
      setPreferredTheme(user.preferredTheme || 'system');
    }
  }, [user, open]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        preferredLanguage: language,
        preferredTheme: preferredTheme as 'light' | 'dark' | 'system',
      });
      
      // Apply theme immediately
      if (preferredTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('calendiqTheme', 'dark');
      } else if (preferredTheme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('calendiqTheme', 'light');
      } else {
        // System preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('calendiqTheme', 'system');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAllChats = () => {
    deleteAllSessions();
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950">
            <Settings2 className="h-12 w-12 text-purple-500" />
          </div>
          <DialogTitle className="text-center text-xl">Settings</DialogTitle>
          <DialogDescription className="text-center">
            Customize your experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </Label>
            <Select value={preferredTheme} onValueChange={setPreferredTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </Label>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
              disabled={sessions.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Chat History ({sessions.length} chats)
            </Button>
            {sessions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">No chat history to delete</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Delete All Chat History?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This will permanently delete all {sessions.length} chat conversations.
            <br />
            <strong className="text-destructive">This action cannot be undone.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction
            onClick={handleDeleteAllChats}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Yes, Delete All Chats
          </AlertDialogAction>
          <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
