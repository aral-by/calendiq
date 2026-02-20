import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Calendar } from 'lucide-react';
import { clearUserProfile } from '@/lib/dbReset';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PINScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { authenticate, user } = useUser();

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    
    if (pin.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      const isValid = await authenticate(pin);
      if (!isValid) {
        setError('Incorrect PIN');
        setPin('');
      }
    } catch (err) {
      setError('Authentication failed');
      console.error('[PIN] Error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && pin.length === 4 && !loading) {
      handleSubmit();
    }
  }

  async function handleReset() {
    if (confirm('Reset app? This will delete all your data including events. This action cannot be undone.')) {
      await clearUserProfile();
    }
  }

  return (
    <CursorProvider>
      <Cursor />
      <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 bg-background">
        {/* Logo - Centered at top */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top duration-500">
          <Calendar className="w-8 h-8 mx-auto text-foreground" strokeWidth={1.5} />
          <h1 className="text-xl font-light tracking-tight">Calendiq</h1>
        </div>

        {/* Main Content - Centered */}
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-light">Welcome back!</h2>
              {user && (
                <p className="text-muted-foreground">
                  {user.firstName}
                </p>
              )}
            </div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder="••••"
              autoFocus
              disabled={loading}
              className="text-center text-5xl h-20 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground tracking-widest"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 p-4 animate-in fade-in slide-in-from-top duration-300">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || pin.length !== 4}
              variant="ghost"
              className="hover:text-foreground"
            >
              {loading ? 'Authenticating...' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Footer - Bottom */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500">
          <p className="text-xs text-muted-foreground">
            Press Enter to continue
          </p>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
            size="sm"
          >
            Forgot PIN? Reset App
          </Button>
        </div>
      </div>
    </CursorProvider>
  );
}
