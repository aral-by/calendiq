import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PINScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { authenticate, user } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Calendiq</h1>
          {user && (
            <p className="text-gray-600">
              Welcome back, {user.firstName}
            </p>
          )}
        </div>

        <p className="text-center text-gray-600 mb-6">
          Enter your PIN to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest"
            placeholder="••••"
            autoFocus
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded p-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading || pin.length !== 4}>
            {loading ? 'Verifying...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
}
