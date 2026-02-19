import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

export function SetupWizard() {
  const [step, setStep] = useState(0); // 0 = splash
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  const { createUser } = useUser();

  // Start splash animation
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2000);
    return () => clearTimeout(timer);
  }, []);

  async function handleNext() {
    setError('');

    if (step === 1) {
      if (!currentInput.trim()) {
        setError('Please enter your first name');
        return;
      }
      setFirstName(currentInput);
      setCurrentInput('');
      setStep(2);
    } else if (step === 2) {
      if (!currentInput.trim()) {
        setError('Please enter your last name');
        return;
      }
      setLastName(currentInput);
      setCurrentInput('');
      setStep(3);
    } else if (step === 3) {
      if (!currentInput) {
        setError('Please select your birth date');
        return;
      }
      setBirthDate(currentInput);
      setCurrentInput('');
      setStep(4);
    } else if (step === 4) {
      if (currentInput.length !== 4 || !/^\d{4}$/.test(currentInput)) {
        setError('PIN must be exactly 4 digits');
        return;
      }
      setPin(currentInput);
      setCurrentInput('');
      setStep(5);
    } else if (step === 5) {
      if (currentInput !== pin) {
        setError('PIN does not match. Try again.');
        setCurrentInput('');
        return;
      }
      await handleSubmit();
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const pinHash = await hashPIN(pin);
      
      await createUser({
        firstName,
        lastName,
        birthDate,
        pinHash,
        createdAt: new Date().toISOString(),
      });
      
      console.log('[Setup] User profile created successfully');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('[Setup] Error:', err);
      setStep(1);
      setCurrentInput('');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (step > 1) {
      setError('');
      setCurrentInput('');
      setStep(step - 1);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !loading) {
      handleNext();
    }
  }

  // Splash Screen
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center gap-4">
            <Calendar className="w-16 h-16 text-white" strokeWidth={1.5} />
            <h1 className="text-7xl font-normal text-white tracking-tight">
              Calendiq
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-normal text-gray-900 tracking-tight">
                Welcome
              </h2>
              <p className="text-lg text-gray-500">
                Let's get to know you
              </p>
            </div>
            <div className="space-y-3 mt-16">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                What's your first name?
              </p>
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter first name"
                className="text-3xl border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-normal text-gray-900 tracking-tight">
                Hi {firstName}
              </h2>
              <p className="text-lg text-gray-500">
                Nice to meet you
              </p>
            </div>
            <div className="space-y-3 mt-16">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                And your last name?
              </p>
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter last name"
                className="text-3xl border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-normal text-gray-900 tracking-tight">
                Perfect
              </h2>
              <p className="text-lg text-gray-500">
                One more thing
              </p>
            </div>
            <div className="space-y-3 mt-16">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                When's your birthday?
              </p>
              <Input
                type="date"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="text-3xl border-0 border-b border-gray-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-normal text-gray-900 tracking-tight">
                Final step
              </h2>
              <p className="text-lg text-gray-500">
                Secure your calendar
              </p>
            </div>
            <div className="space-y-6 mt-16">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Create a 4-digit PIN
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  If you forget this PIN, all your data will be lost.
                  <br />
                  Keep it safe and don't share it with anyone.
                </p>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="text-5xl font-light border-0 border-b border-gray-200 rounded-none px-0 text-center tracking-[0.5em] focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="space-y-2">
              <h2 className="text-5xl font-normal text-gray-900 tracking-tight">
                Confirm PIN
              </h2>
              <p className="text-lg text-gray-500">
                Just to be sure
              </p>
            </div>
            <div className="space-y-3 mt-16">
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Re-enter your PIN
              </p>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="text-5xl font-light border-0 border-b border-gray-200 rounded-none px-0 text-center tracking-[0.5em] focus-visible:ring-0 focus-visible:border-gray-900 transition-colors"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8 py-16">
      <div className="w-full max-w-2xl">
        {/* Progress dots */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                  s === step
                    ? 'bg-gray-900 scale-150'
                    : s < step
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-12">
          {renderStep()}

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-6 pt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="text-sm text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading || (step === 4 && currentInput.length !== 4) || (step === 5 && currentInput.length !== 4)}
              className="ml-auto text-sm text-gray-900 hover:text-gray-600 transition-colors uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : step === 5 ? 'Finish' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-20 text-center">
          <p className="text-xs text-gray-300 uppercase tracking-wider">
            Press Enter to continue
          </p>
        </div>
      </div>
    </div>
  );
}
