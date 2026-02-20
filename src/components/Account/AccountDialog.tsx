import { useState, useEffect } from 'react';
import { User, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { user, updateUser } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setDateOfBirth(user.dateOfBirth);
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
            <User className="h-12 w-12 text-blue-500" />
          </div>
          <DialogTitle className="text-center text-xl">Account Settings</DialogTitle>
          <DialogDescription className="text-center">
            Update your personal information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !firstName.trim() || !lastName.trim() || !dateOfBirth}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
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
  );
}
