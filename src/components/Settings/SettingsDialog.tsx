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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
            <Settings2 className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">Settings</DialogTitle>
          <DialogDescription className="text-center">
            Customize your Calendiq experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription>Manage your language and appearance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="theme" className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  Theme
                </Label>
                <Select value={preferredTheme} onValueChange={setPreferredTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">💻 System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions that affect your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-destructive">Delete All Chat History</h4>
                    <p className="text-xs text-muted-foreground">
                      Permanently remove all {sessions.length} chat conversations from your account.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={sessions.length === 0}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete {sessions.length} {sessions.length === 1 ? 'Chat' : 'Chats'}
                  </Button>
                  {sessions.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      No chat history to delete
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 animate-in zoom-in-50 duration-300">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Delete All Chat History?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p>
              This will permanently delete all <strong>{sessions.length}</strong> chat {sessions.length === 1 ? 'conversation' : 'conversations'}.
            </p>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold text-destructive text-center">
                  ⚠️ This action cannot be undone
                </p>
              </CardContent>
            </Card>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-4">
          <AlertDialogCancel className="w-full m-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAllChats}
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Yes, Delete All {sessions.length} {sessions.length === 1 ? 'Chat' : 'Chats'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
