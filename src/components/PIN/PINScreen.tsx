import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Calendar } from 'lucide-react';
import { clearUserProfile } from '@/lib/dbReset';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/animate-ui/components/buttons/button';

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
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="space-y-12">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-10 h-10 text-gray-700" strokeWidth={1.5} />
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 tracking-tight">
                  Calendiq
                </h1>
              </div>
              {user && (
                <p className="text-base font-light text-gray-400 pl-13">
                  Welcome back, {user.firstName}
                </p>
              )}
            </div>

            {/* PIN Input */}
            <div className="space-y-6">
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Enter PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="w-full text-5xl font-light border-0 border-b border-gray-200 rounded-none px-0 py-3 text-center tracking-[0.5em] bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder:text-gray-300"
                autoFocus
                disabled={loading}
              />

              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-red-500 text-center">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-6">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={loading || pin.length !== 4}
                  className="w-full bg-gray-800 text-white hover:bg-gray-700 h-10 text-sm rounded-lg"
                >
                  {loading ? 'Authenticating...' : 'Continue'}
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 space-y-3">
              <p className="text-xs text-gray-300 uppercase tracking-wider">
                Press Enter ↵
              </p>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-600"
                size="sm"
              >
                Forgot PIN? Reset App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
