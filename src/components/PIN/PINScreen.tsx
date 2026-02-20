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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-4 sm:px-6">
        <div className="w-full max-w-lg animate-in fade-in zoom-in duration-700">
          <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-lg">
            <div className="space-y-10 sm:space-y-12">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="bg-white/80 p-2 rounded-2xl shadow-sm">
                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-gray-700 tracking-tight">
                    Calendiq
                  </h1>
                </div>
                {user && (
                  <p className="text-sm sm:text-base font-light text-gray-400 text-center sm:text-left sm:pl-14">
                    Welcome back, {user.firstName}
                  </p>
                )}
              </div>

              {/* PIN Input */}
              <div className="space-y-6">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium text-center sm:text-left block">
                  Enter PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={handleKeyPress}
                    placeholder="••••"
                    className="w-full text-4xl sm:text-5xl font-normal border-0 border-b border-gray-200 rounded-t-2xl bg-white/50 px-4 py-3 text-center tracking-[0.5em] focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                      <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-4 sm:pt-6">
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={loading || pin.length !== 4}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 h-10 sm:h-11 text-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {loading ? 'Authenticating...' : 'Continue'}
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 sm:pt-6 space-y-3">
                <p className="text-xs text-gray-300 uppercase tracking-wider">
                  Press Enter ↵
                </p>
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-600 rounded-2xl"
                  size="sm"
                >
                  Forgot PIN? Reset App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
