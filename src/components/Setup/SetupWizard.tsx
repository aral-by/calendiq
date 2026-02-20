import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Calendar, Moon, Sun, GraduationCap, Briefcase, Heart, Sparkles, Check } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/animate-ui/components/buttons/button';

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | ''>('');
  const [purpose, setPurpose] = useState<'school' | 'work' | 'health' | 'general' | ''>('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createUser } = useUser();

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2500);
    return () => clearTimeout(timer);
  }, []);

  async function handleContinue() {
    setError('');
    
    if (step === 1 && !firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (step === 2 && !lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (step === 3 && !birthDate) {
      setError('Please select your birth date');
      return;
    }
    if (step === 4 && !theme) {
      setError('Please select a theme');
      return;
    }
    if (step === 5 && !purpose) {
      setError('Please select a purpose');
      return;
    }
    if (step === 6 && (pin.length !== 4 || !/^\d{4}$/.test(pin))) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (step === 7 && confirmPin !== pin) {
      setError('PIN does not match');
      setConfirmPin('');
      return;
    }

    if (step === 7) {
      await handleFinish();
    } else {
      setStep(step + 1);
    }
  }

  async function handleFinish() {
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
      
      setStep(8);
      setTimeout(() => {}, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('[Setup] Error:', err);
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (step > 1 && step < 8) {
      setError('');
      setStep(step - 1);
    }
  }

  // Splash Screen
  if (step === 0) {
    return (
      <CursorProvider>
        <Cursor />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full" />
              <Calendar className="w-28 h-28 text-blue-600 mx-auto relative" strokeWidth={1.5} />
            </div>
            <h1 className="text-6xl font-semibold text-gray-900 tracking-tight">Calendiq</h1>
            <p className="text-gray-500">Your personal calendar assistant</p>
          </div>
        </div>
      </CursorProvider>
    );
  }

  // Final Success Screen
  if (step === 8) {
    return (
      <CursorProvider>
        <Cursor />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
          <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full" />
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto relative">
                <Check className="w-14 h-14 text-green-600" strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-5xl font-semibold text-gray-900">All Set!</h2>
              <p className="text-xl text-gray-600">
                Welcome to Calendiq, {firstName}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-500 leading-relaxed">
                Don't worry about choosing work, school, or health—
                <br />
                <span className="font-medium text-gray-700">Calendiq covers everything! 🎉</span>
              </p>
            </div>
          </div>
        </div>
      </CursorProvider>
    );
  }

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  return (
    <CursorProvider>
      <Cursor />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100/50 backdrop-blur-sm bg-white/80">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Calendar className="w-8 h-8 text-blue-600" strokeWidth={1.75} />
            <h1 className="text-2xl font-semibold text-gray-900">Calendiq</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto px-6 md:px-8 pt-8">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2 text-center">Step {step} of {totalSteps}</p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100/50 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Step 1: First Name */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-5xl md:text-6xl font-semibold text-gray-900">Hello!</h2>
                  <p className="text-xl text-gray-500">Let's start with your first name</p>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                    placeholder="Enter your first name"
                    className="w-full text-3xl font-medium bg-white/80 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 2: Last Name */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-5xl md:text-6xl font-semibold text-gray-900">Nice, {firstName}!</h2>
                  <p className="text-xl text-gray-500">What's your last name?</p>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                    placeholder="Enter your last name"
                    className="w-full text-3xl font-medium bg-white/80 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 3: Birth Date */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-5xl md:text-6xl font-semibold text-gray-900">Perfect!</h2>
                  <p className="text-xl text-gray-500">When's your birthday?</p>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Birth Date</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-3xl font-medium bg-white/80 border-2 border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Step 4: Theme Selection */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">How do you like it?</h2>
                  <p className="text-lg text-gray-500">Choose your preferred theme</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                      theme === 'light'
                        ? 'border-blue-400 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Sun className={`w-12 h-12 mx-auto mb-3 ${theme === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">Light</p>
                    <p className="text-sm text-gray-500 mt-1">Bright & clean</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-blue-400 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Moon className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">Dark</p>
                    <p className="text-sm text-gray-500 mt-1">Easy on eyes</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Purpose Selection */}
            {step === 5 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">What's your focus?</h2>
                  <p className="text-lg text-gray-500">We'll personalize your experience</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPurpose('school')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      purpose === 'school'
                        ? 'border-purple-400 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <GraduationCap className={`w-10 h-10 mx-auto mb-2 ${purpose === 'school' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">School</p>
                  </button>
                  <button
                    onClick={() => setPurpose('work')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      purpose === 'work'
                        ? 'border-blue-400 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Briefcase className={`w-10 h-10 mx-auto mb-2 ${purpose === 'work' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">Work</p>
                  </button>
                  <button
                    onClick={() => setPurpose('health')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      purpose === 'health'
                        ? 'border-pink-400 bg-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-10 h-10 mx-auto mb-2 ${purpose === 'health' ? 'text-pink-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">Health</p>
                  </button>
                  <button
                    onClick={() => setPurpose('general')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      purpose === 'general'
                        ? 'border-amber-400 bg-amber-50 shadow-lg'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <Sparkles className={`w-10 h-10 mx-auto mb-2 ${purpose === 'general' ? 'text-amber-600' : 'text-gray-400'}`} />
                    <p className="font-semibold text-gray-900">General</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Create PIN */}
            {step === 6 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">Stay Secure</h2>
                  <p className="text-lg text-gray-500">Create a 4-digit PIN</p>
                </div>
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm text-amber-800 leading-relaxed">
                      ⚠️ If you forget this PIN, all your data will be lost. Keep it safe!
                    </p>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">PIN Code</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                      placeholder="••••"
                      className="w-full text-6xl font-semibold text-center tracking-[0.5em] bg-white/80 border-2 border-gray-200 rounded-2xl px-6 py-6 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Confirm PIN */}
            {step === 7 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">One More Time</h2>
                  <p className="text-lg text-gray-500">Re-enter your PIN to confirm</p>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Confirm PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                    placeholder="••••"
                    className="w-full text-6xl font-semibold text-center tracking-[0.5em] bg-white/80 border-2 border-gray-200 rounded-2xl px-6 py-6 focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 placeholder:text-gray-300"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 gap-4">
              {step > 1 && step < 8 && (
                <Button
                  onClick={handleBack}
                  disabled={loading}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 text-base px-6"
                >
                  ← Back
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={loading}
                className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-200 px-8 py-3 text-base font-semibold rounded-xl"
              >
                {loading ? 'Setting up...' : step === 7 ? 'Finish' : 'Continue →'}
              </Button>
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-gray-400 mt-6 uppercase tracking-wider">
              Press Enter to continue
            </p>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Calendar, Moon, Sun, GraduationCap, Briefcase, Heart, Sparkles, Check } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/animate-ui/components/buttons/button';

export function SetupWizard() {
  const [step, setStep] = useState(0); // 0 = splash, 1-3 = info, 4 = theme, 5 = purpose, 6-7 = pin, 8 = final
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | ''>('');
  const [purpose, setPurpose] = useState<'school' | 'work' | 'health' | 'general' | ''>('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createUser } = useUser();

  // Start splash animation
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 2500);
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
      setCurrentInput('');
      setStep(6);
    } else if (step === 6) {
      if (!theme) {
        setError('Please choose how you want to use Calendiq');
        return;
      }
      setStep(7);
    } else if (step === 7) {
      if (!purpose) {
        setError('Please tell us what you'll use Calendiq for');
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
                  className="w-full text-2xl sm:text-3xl font-normal bg-gray-50/50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-gray-50 transition-all duration-300 placeholder:text-gray-300"
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
                  className="w-full text-2xl sm:text-3xl font-normal bg-gray-50/50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-gray-50 transition-all duration-300 placeholder:text-gray-300"
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
                  className="w-full text-2xl sm:text-3xl font-normal bg-gray-50/50 border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-600 focus:bg-gray-50 transition-all duration-300"
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
                  className="w-full text-5xl sm:text-6xl font-normal bg-gray-50/50 border border-gray-200 px-4 py-4 text-center tracking-[0.5em] focus:outline-none focus:border-gray-600 focus:bg-gray-50 transition-all duration-300 placeholder:text-gray-300"
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
            <div className="bg-gray-50 p-1.5 rounded-lg">
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
                  <div className="bg-red-50 border border-red-200 px-4 py-2.5">
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
                    className="text-gray-400 hover:text-gray-700 text-sm"
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
                  className="ml-auto bg-gray-700 text-white hover:bg-gray-600 px-6 sm:px-8 text-sm transition-colors duration-200"
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
