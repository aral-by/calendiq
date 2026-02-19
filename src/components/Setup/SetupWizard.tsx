import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/lib/hashUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SetupWizard() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');

  const { createUser } = useUser();

  async function handleNext() {
    setError('');

    if (step === 1) {
      if (!currentInput.trim()) {
        setError('Lütfen adınızı girin');
        return;
      }
      setFirstName(currentInput);
      setCurrentInput('');
      setStep(2);
    } else if (step === 2) {
      if (!currentInput.trim()) {
        setError('Lütfen soyadınızı girin');
        return;
      }
      setLastName(currentInput);
      setCurrentInput('');
      setStep(3);
    } else if (step === 3) {
      if (!currentInput) {
        setError('Lütfen doğum tarihinizi seçin');
        return;
      }
      setBirthDate(currentInput);
      setCurrentInput('');
      setStep(4);
    } else if (step === 4) {
      if (currentInput.length !== 4 || !/^\d{4}$/.test(currentInput)) {
        setError('PIN tam olarak 4 rakam olmalı');
        return;
      }
      setPin(currentInput);
      setCurrentInput('');
      setStep(5);
    } else if (step === 5) {
      if (currentInput !== pin) {
        setError('PIN eşleşmiyor. Tekrar deneyin.');
        setCurrentInput('');
        return;
      }
      setPinConfirm(currentInput);
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
      setError('Bir şeyler yanlış gitti. Lütfen tekrar deneyin.');
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-indigo-600">
                Calendiq'e Hoş Geldin!
              </h1>
              <p className="text-2xl text-gray-600">
                Seni tanıyalım
              </p>
            </div>
            <div className="space-y-4 mt-12">
              <p className="text-xl text-gray-700 text-center">
                İlk soruyla başlayalım. Adın ne?
              </p>
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Adınızı girin"
                className="text-2xl text-center p-8"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-indigo-600">
                Merhaba {firstName}!
              </h1>
              <p className="text-2xl text-gray-600">
                Tanıştığımıza memnun olduk
              </p>
            </div>
            <div className="space-y-4 mt-12">
              <p className="text-xl text-gray-700 text-center">
                Peki soyadın ne, {firstName}?
              </p>
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Soyadınızı girin"
                className="text-2xl text-center p-8"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-indigo-600">
                Harika, {firstName}!
              </h1>
              <p className="text-2xl text-gray-600">
                Bir adım daha yaklaştık
              </p>
            </div>
            <div className="space-y-4 mt-12">
              <p className="text-xl text-gray-700 text-center">
                Takviminde doğum günü hatırlatması yapalım mı?
                <br />
                <span className="text-lg text-gray-500">Doğum tarihin nedir?</span>
              </p>
              <Input
                type="date"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                className="text-2xl text-center p-8"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-amber-600">
                İşte son adım!
              </h1>
              <p className="text-2xl text-gray-600">
                Neredeyse hazırız
              </p>
            </div>
            <div className="space-y-6 mt-12">
              <p className="text-xl text-gray-700 text-center">
                Takvinine erişmek için 4 haneli bir PIN oluştur
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <p className="text-lg text-amber-800 text-center font-medium">
                  Bu PIN'i unutursan tüm verilerine erişimini kaybedersin!
                </p>
                <p className="text-sm text-amber-700 text-center mt-2">
                  Kimseyle paylaşma ve güvenli bir yere yaz.
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
                className="text-4xl text-center p-8 tracking-widest"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-green-600">
                Neredeyse bitti!
              </h1>
              <p className="text-2xl text-gray-600">
                Emin olmak için bir kez daha
              </p>
            </div>
            <div className="space-y-4 mt-12">
              <p className="text-xl text-gray-700 text-center">
                PIN'ini tekrar gir
              </p>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="text-4xl text-center p-8 tracking-widest"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="w-full max-w-3xl">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-500 ${
                  s === step
                    ? 'w-16 bg-indigo-600'
                    : s < step
                    ? 'w-12 bg-indigo-400'
                    : 'w-8 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Adım {step} / 5
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {renderStep()}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
              <p className="text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 text-lg py-6"
              >
                Geri
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading || (step === 4 && currentInput.length !== 4) || (step === 5 && currentInput.length !== 4)}
              className="flex-1 text-lg py-6"
            >
              {loading ? 'Kaydediliyor...' : step === 5 ? 'Tamamla' : 'İleri'}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Enter tuşuna basarak devam edebilirsin
        </p>
      </div>
    </div>
  );
}
