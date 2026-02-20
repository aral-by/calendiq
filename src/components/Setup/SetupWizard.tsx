import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Calendar, Moon, Sun, GraduationCap, Briefcase, Heart, Sparkles } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/animate-ui/components/buttons/button';

export function SetupWizard() {
  const [step, setStep] = useState(0); // 0 = splash
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pin, setPin] = useState('');
  const [theme, setTheme] = useState('');
  const [purpose, setPurpose] = useState('');
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
      setStep(6);
    } else if (step === 6) {
      // Theme selection - no validation needed, handled by buttons
      if (!theme) {
        setError('Please select a theme');
        return;
      }
      setStep(7);
    } else if (step === 7) {
      // Purpose selection - no validation needed, handled by buttons
      if (!purpose) {
        setError('Please select your primary use case');
        return;
      }
      setStep(8);
    } else if (step === 8) {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm">
              <Calendar className="w-20 h-20 text-gray-700 mx-auto mb-4" strokeWidth={1.25} />
              <h1 className="text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">Calendiq</h1>
            </div>
          </div>
        </div>
      </CursorProvider>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Welcome
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                Let's get to know you
              </p>
            </div>
            <div className="space-y-3 mt-12 sm:mt-16">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your first name"
                  className="w-full text-2xl sm:text-3xl font-normal border-0 border-b border-gray-200 rounded-t-xl bg-white/50 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Hi, {firstName}
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                Nice to meet you
              </p>
            </div>
            <div className="space-y-3 mt-12 sm:mt-16">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your last name"
                  className="w-full text-2xl sm:text-3xl font-normal border-0 border-b border-gray-200 rounded-t-xl bg-white/50 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Perfect
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                One more thing
              </p>
            </div>
            <div className="space-y-3 mt-12 sm:mt-16">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Birth Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-normal border-0 border-b border-gray-200 rounded-t-xl bg-white/50 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Security
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                Create a 4-digit PIN
              </p>
            </div>
            <div className="space-y-6 mt-12 sm:mt-16">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 leading-relaxed">
                  This PIN secures your calendar. If forgotten, all data will be lost.
                  <br />
                  Keep it safe and confidential.
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                  PIN Code
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={handleKeyPress}
                    placeholder="••••"
                    className="w-full text-5xl sm:text-6xl font-normal border-0 border-b border-gray-200 rounded-t-2xl bg-white/50 px-4 py-4 text-center tracking-[0.5em] focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Confirm
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                Re-enter your PIN
              </p>
            </div>
            <div className="space-y-3 mt-12 sm:mt-16">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                PIN Code
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  placeholder="••••"
                  className="w-full text-5xl sm:text-6xl font-normal border-0 border-b border-gray-200 rounded-t-2xl bg-white/50 px-4 py-4 text-center tracking-[0.5em] focus:outline-none focus:border-gray-600 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                  autoFocus
                  disabled={loading}
                />
              </div>
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50">
        {/* Header */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-700" strokeWidth={1.5} />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 tracking-tight">
              Calendiq
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 pb-8 sm:pb-12">
          <div className="w-full max-w-xl">
            {/* Progress */}
            <div className="mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-all duration-700 ease-out ${
                      s === step
                        ? 'bg-gray-700 w-8 sm:w-10'
                        : s < step
                        ? 'bg-gray-400 w-5 sm:w-6'
                        : 'bg-gray-200 w-3 sm:w-4'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-10 sm:space-y-12">
              {renderStep()}

              {error && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 sm:pt-8">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-700 text-sm rounded-2xl"
                    size="sm"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  onClick={handleNext}
                  disabled={loading || (step === 4 && currentInput.length !== 4) || (step === 5 && currentInput.length !== 4)}
                  className="ml-auto bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 px-6 sm:px-8 rounded-2xl text-sm shadow-sm hover:shadow-md transition-all duration-300"
                  size="sm"
                >
                  {loading ? 'Processing...' : step === 5 ? 'Complete' : 'Continue'}
                </Button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-xs text-gray-300 uppercase tracking-wider">
                Press Enter ↵
              </p>
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
