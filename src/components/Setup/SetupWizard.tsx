import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Calendar, Moon, Sun, GraduationCap, Briefcase, Heart, Sparkles } from 'lucide-react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | ''>('');
  const [purpose, setPurpose] = useState<'school' | 'work' | 'health' | 'general' | ''>('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createUser } = useUser();

  useEffect(() => {
    if (selectedTheme) {
      if (selectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [selectedTheme]);

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
    if (step === 4 && !selectedTheme) {
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
      
      // Save theme preference
      if (selectedTheme) {
        localStorage.setItem('calendiqTheme', selectedTheme);
      }
      
      await createUser({
        firstName,
        lastName,
        birthDate,
        pinHash,
        createdAt: new Date().toISOString(),
      });
      
      setStep(8);
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

  const totalSteps = 7;

  if (step === 0) {
    return (
      <CursorProvider>
        <Cursor />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 animate-in fade-in duration-1000">
            <Calendar className="w-20 h-20 mx-auto text-foreground" strokeWidth={1.5} />
            <h1 className="text-5xl font-light tracking-tight">Calendiq</h1>
          </div>
        </div>
      </CursorProvider>
    );
  }

  if (step === 8) {
    return (
      <CursorProvider>
        <Cursor />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <Sparkles className="h-16 w-16 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-light">All Set!</h2>
              <p className="text-muted-foreground">
                Calendiq has everything you need. You're ready to go!
              </p>
            </div>
          </div>
        </div>
      </CursorProvider>
    );
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
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
          
          {/* Step 1: First Name */}
          {step === 1 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-light">Hello!</h2>
                <p className="text-muted-foreground">Let's start with your first name</p>
              </div>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                placeholder="First name"
                autoFocus
                className="text-center text-2xl h-14 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
          )}

          {/* Step 2: Last Name */}
          {step === 2 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-light">Nice, {firstName}!</h2>
                <p className="text-muted-foreground">What's your last name?</p>
              </div>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                placeholder="Last name"
                autoFocus
                className="text-center text-2xl h-14 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
          )}

          {/* Step 3: Birth Date */}
          {step === 3 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-light">Perfect!</h2>
                <p className="text-muted-foreground">When's your birthday?</p>
              </div>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                autoFocus
                className="text-center text-xl h-14 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground"
              />
            </div>
          )}

          {/* Step 4: Theme Selection */}
          {step === 4 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-light">How do you like it?</h2>
                <p className="text-muted-foreground">Choose your preferred theme</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setSelectedTheme('light')}
                  className={`p-8 border transition-all duration-300 ${
                    selectedTheme === 'light'
                      ? 'border-foreground bg-accent'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  <Sun className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-light">Light</p>
                </button>
                <button
                  onClick={() => setSelectedTheme('dark')}
                  className={`p-8 border transition-all duration-300 ${
                    selectedTheme === 'dark'
                      ? 'border-foreground bg-accent'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  <Moon className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-light">Dark</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Purpose Selection */}
          {step === 5 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-light">What's your focus?</h2>
                <p className="text-muted-foreground">We'll personalize your experience</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPurpose('school')}
                  className={`p-6 border transition-all duration-500 group ${
                    purpose === 'school'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-border hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                  }`}
                >
                  <GraduationCap 
                    className={`w-8 h-8 mx-auto mb-2 transition-all duration-500 ${
                      purpose === 'school' 
                        ? 'text-purple-600 dark:text-purple-400 scale-110' 
                        : 'text-muted-foreground group-hover:text-purple-500 group-hover:scale-105'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <p className={`font-light text-sm transition-colors duration-300 ${
                    purpose === 'school' ? 'text-purple-700 dark:text-purple-300' : 'group-hover:text-purple-600'
                  }`}>School</p>
                </button>
                <button
                  onClick={() => setPurpose('work')}
                  className={`p-6 border transition-all duration-500 group ${
                    purpose === 'work'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-border hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                  }`}
                >
                  <Briefcase 
                    className={`w-8 h-8 mx-auto mb-2 transition-all duration-500 ${
                      purpose === 'work' 
                        ? 'text-blue-600 dark:text-blue-400 scale-110' 
                        : 'text-muted-foreground group-hover:text-blue-500 group-hover:scale-105'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <p className={`font-light text-sm transition-colors duration-300 ${
                    purpose === 'work' ? 'text-blue-700 dark:text-blue-300' : 'group-hover:text-blue-600'
                  }`}>Work</p>
                </button>
                <button
                  onClick={() => setPurpose('health')}
                  className={`p-6 border transition-all duration-500 group ${
                    purpose === 'health'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                      : 'border-border hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20'
                  }`}
                >
                  <Heart 
                    className={`w-8 h-8 mx-auto mb-2 transition-all duration-500 ${
                      purpose === 'health' 
                        ? 'text-pink-600 dark:text-pink-400 scale-110' 
                        : 'text-muted-foreground group-hover:text-pink-500 group-hover:scale-105'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <p className={`font-light text-sm transition-colors duration-300 ${
                    purpose === 'health' ? 'text-pink-700 dark:text-pink-300' : 'group-hover:text-pink-600'
                  }`}>Health</p>
                </button>
                <button
                  onClick={() => setPurpose('general')}
                  className={`p-6 border transition-all duration-500 group ${
                    purpose === 'general'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : 'border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                  }`}
                >
                  <Sparkles 
                    className={`w-8 h-8 mx-auto mb-2 transition-all duration-500 ${
                      purpose === 'general' 
                        ? 'text-amber-600 dark:text-amber-400 scale-110' 
                        : 'text-muted-foreground group-hover:text-amber-500 group-hover:scale-105'
                    }`} 
                    strokeWidth={1.5} 
                  />
                  <p className={`font-light text-sm transition-colors duration-300 ${
                    purpose === 'general' ? 'text-amber-700 dark:text-amber-300' : 'group-hover:text-amber-600'
                  }`}>General</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Create PIN */}
          {step === 6 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-light">Stay Secure</h2>
                <p className="text-muted-foreground">Create a 4-digit PIN</p>
              </div>
              <div className="space-y-4">
                <div className="bg-muted/50 border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    If you forget this PIN, all your data will be lost
                  </p>
                </div>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                  placeholder="••••"
                  autoFocus
                  className="text-center text-5xl h-20 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground tracking-widest"
                />
              </div>
            </div>
          )}

          {/* Step 7: Confirm PIN */}
          {step === 7 && (
            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-light">One More Time</h2>
                <p className="text-muted-foreground">Re-enter your PIN to confirm</p>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                placeholder="••••"
                autoFocus
                className="text-center text-5xl h-20 border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-foreground tracking-widest"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 p-4 animate-in fade-in slide-in-from-top duration-300">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              variant="ghost"
              className="hover:text-foreground"
            >
              {loading ? 'Setting up...' : step === 7 ? 'Finish' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Step Indicator - Bottom */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-2 justify-center">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1.5 transition-all duration-300 ${
                  s === step ? 'w-8 bg-foreground' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>
    </CursorProvider>
  );
}
