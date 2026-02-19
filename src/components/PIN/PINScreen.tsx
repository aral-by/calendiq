import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-700">
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-12 h-12 text-gray-900" strokeWidth={1.5} />
              <h1 className="text-6xl font-normal text-gray-900 tracking-tight">
                Calendiq
              </h1>
            </div>
            {user && (
              <p className="text-lg text-gray-500">
                Welcome back, {user.firstName}
              </p>
            )}
          </div>

          {/* PIN Input */}
          <div className="space-y-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Enter your PIN
            </p>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder="••••"
              className="text-6xl border-0 border-b border-gray-200 rounded-none px-0 text-center tracking-[0.5em] focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
              autoFocus
              disabled={loading}
            />

            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={() => handleSubmit()}
              disabled={loading || pin.length !== 4}
              className="w-full text-sm text-gray-900 hover:text-gray-600 transition-colors uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed pt-8"
            >
              {loading ? 'Please wait...' : 'Continue'}
            </button>
          </div>

          {/* Footer hint */}
          <div className="text-center pt-8">
            <p className="text-xs text-gray-300 uppercase tracking-wider">
              Press Enter to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
