import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Calendar } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/animate-ui/components/buttons/button';

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
      <CursorProvider>
        <Cursor />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <Calendar className="w-32 h-32 text-gray-900 mx-auto" strokeWidth={0.75} />
            <h1 className="text-7xl font-extralight text-gray-900 tracking-tight">Calendiq</h1>
          </div>
        </div>
      </CursorProvider>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-light text-gray-900 tracking-tight">
                Welcome
              </h2>
              <p className="text-xl text-gray-400">
                Let's get to know you
              </p>
            </div>
            <div className="space-y-4 mt-20">
              <label className="text-xs text-gray-400 uppercase tracking-widest">
                First Name
              </label>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your first name"
                className="w-full text-4xl font-light border-0 border-b-2 border-gray-100 rounded-none px-0 py-3 bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300 placeholder:text-gray-200"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-light text-gray-900 tracking-tight">
                Hi, {firstName}
              </h2>
              <p className="text-xl text-gray-400">
                Nice to meet you
              </p>
            </div>
            <div className="space-y-4 mt-20">
              <label className="text-xs text-gray-400 uppercase tracking-widest">
                Last Name
              </label>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your last name"
                className="w-full text-4xl font-light border-0 border-b-2 border-gray-100 rounded-none px-0 py-3 bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300 placeholder:text-gray-200"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-light text-gray-900 tracking-tight">
                Perfect
              </h2>
              <p className="text-xl text-gray-400">
                One more thing
              </p>
            </div>
            <div className="space-y-4 mt-20">
              <label className="text-xs text-gray-400 uppercase tracking-widest">
                Birth Date
              </label>
              <input
                type="date"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="w-full text-4xl font-light border-0 border-b-2 border-gray-100 rounded-none px-0 py-3 bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-light text-gray-900 tracking-tight">
                Security
              </h2>
              <p className="text-xl text-gray-400">
                Create a 4-digit PIN
              </p>
            </div>
            <div className="space-y-8 mt-20">
              <div className="space-y-3">
                <p className="text-sm text-gray-500 leading-relaxed">
                  This PIN secures your calendar. If forgotten, all data will be lost.
                  <br />
                  Keep it safe and confidential.
                </p>
              </div>
              <div className="space-y-4">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  PIN Code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="••••"
                  className="w-full text-6xl font-extralight border-0 border-b-2 border-gray-100 rounded-none px-0 py-3 text-center tracking-[0.75em] bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300 placeholder:text-gray-200"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3">
              <h2 className="text-6xl md:text-7xl font-light text-gray-900 tracking-tight">
                Confirm
              </h2>
              <p className="text-xl text-gray-400">
                Re-enter your PIN
              </p>
            </div>
            <div className="space-y-4 mt-20">
              <label className="text-xs text-gray-400 uppercase tracking-widest">
                PIN Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="w-full text-6xl font-extralight border-0 border-b-2 border-gray-100 rounded-none px-0 py-3 text-center tracking-[0.75em] bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300 placeholder:text-gray-200"
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
    <CursorProvider>
      <Cursor />
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
              Calendiq
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-12 pb-16">
          <div className="w-full max-w-2xl">
            {/* Progress */}
            <div className="mb-16">
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-all duration-700 ease-out ${
                      s === step
                        ? 'bg-gray-900 w-12'
                        : s < step
                        ? 'bg-gray-400 w-8'
                        : 'bg-gray-200 w-6'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-16">
              {renderStep()}

              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-red-500 text-center">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-12">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  onClick={handleNext}
                  disabled={loading || (step === 4 && currentInput.length !== 4) || (step === 5 && currentInput.length !== 4)}
                  className="ml-auto bg-gray-900 text-white hover:bg-gray-800 px-8"
                >
                  {loading ? 'Processing...' : step === 5 ? 'Complete' : 'Continue'}
                </Button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-20 text-center">
              <p className="text-xs text-gray-300 uppercase tracking-widest">
                Press Enter ↵
              </p>
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
