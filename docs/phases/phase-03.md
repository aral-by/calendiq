# Phase 3: Authentication & PIN System

**Status:** Not Started  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 2

---

## Objectives

- Implement PIN hashing and validation
- Create Setup Wizard for first-time users
- Build PIN entry screen for returning users
- Set up user authentication flow
- Create UserContext for state management

---

## Tasks

### 3.1 Create PIN Hashing Service

**src/services/pinHasher.ts:**
```typescript
export async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  const pinHash = await hashPIN(pin);
  return pinHash === hash;
}
```

---

### 3.2 Create User Context

**src/context/UserContext.tsx:**
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/types/user';
import { IndexedDBUserRepository } from '@/db/repositories';

interface UserContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  loading: boolean;
  createUser: (profile: Omit<UserProfile, 'id'>) => Promise<void>;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const userRepo = new IndexedDBUserRepository();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  async function checkSetupStatus() {
    try {
      const exists = await userRepo.exists();
      setIsSetupComplete(exists);
      if (exists) {
        const profile = await userRepo.get();
        setUser(profile || null);
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(profile: Omit<UserProfile, 'id'>) {
    try {
      const newUser = await userRepo.create(profile);
      setUser(newUser);
      setIsSetupComplete(true);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async function authenticate(pin: string): Promise<boolean> {
    try {
      if (!user) return false;
      
      const { verifyPIN } = await import('@/services/pinHasher');
      const isValid = await verifyPIN(pin, user.pinHash);
      
      if (isValid) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  function logout() {
    setIsAuthenticated(false);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isSetupComplete,
        loading,
        createUser,
        authenticate,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

---

### 3.3 Create Setup Wizard Component

**src/components/Setup/SetupWizard.tsx:**
```typescript
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { hashPIN } from '@/services/pinHasher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SetupWizard() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createUser } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!firstName || !lastName || !birthDate) {
      setError('All fields are required');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== pinConfirm) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      const pinHash = await hashPIN(pin);
      
      await createUser({
        firstName,
        lastName,
        birthDate,
        pinHash,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to Calendiq</h1>
        <p className="text-center text-muted-foreground mb-6">
          Let&apos;s set up your profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="pin">Create 4-Digit PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div>
            <Label htmlFor="pinConfirm">Confirm PIN</Label>
            <Input
              id="pinConfirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Setting up...' : 'Get Started'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

### 3.4 Create PIN Entry Screen

**src/components/PIN/PINScreen.tsx:**
```typescript
import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PINScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { authenticate } = useUser();

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6">Calendiq</h1>
        <p className="text-center text-muted-foreground mb-6">
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
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

### 3.5 Update App.tsx with Authentication Flow

**src/App.tsx:**
```typescript
import { UserProvider, useUser } from '@/context/UserContext';
import { SetupWizard } from '@/components/Setup/SetupWizard';
import { PINScreen } from '@/components/PIN/PINScreen';

function AppContent() {
  const { isSetupComplete, isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSetupComplete) {
    return <SetupWizard />;
  }

  if (!isAuthenticated) {
    return <PINScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Main App (Coming in Phase 4)</h1>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
```

---

## Acceptance Criteria

- [ ] Setup wizard displays on first launch
- [ ] User can create profile with all required fields
- [ ] PIN validation works (must be 4 digits, must match)
- [ ] PIN is hashed before storage (never plain text)
- [ ] Setup wizard saves data to IndexedDB
- [ ] PIN screen displays on subsequent launches
- [ ] Correct PIN grants access to main app
- [ ] Incorrect PIN shows error message
- [ ] User state persists across page refreshes

---

## Testing Checklist

1. Clear IndexedDB (Dev Tools → Application → IndexedDB)
2. Reload app → Should show Setup Wizard
3. Fill out form with valid data → Should proceed to main app
4. Reload app → Should show PIN screen
5. Enter wrong PIN → Should show error
6. Enter correct PIN → Should grant access

---

## Next Phase

Proceed to **Phase 4: Calendar UI & Manual CRUD**
