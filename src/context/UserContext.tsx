import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/types/user';
import { IndexedDBUserRepository } from '@/db/repositories';
import { verifyPIN } from '@/lib/hashUtils';

interface UserContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  loading: boolean;
  showWelcome: boolean;
  createUser: (profile: Omit<UserProfile, 'id'>) => Promise<void>;
  updateUser: (updates: Partial<Omit<UserProfile, 'id' | 'pinHash'>>) => Promise<void>;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => void;
  hideWelcome: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage for authentication status
    const savedAuth = localStorage.getItem('calendiqAuth');
    return savedAuth === 'true';
  });
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  
  const userRepo = new IndexedDBUserRepository();

  // Persist authentication status to localStorage
  useEffect(() => {
    localStorage.setItem('calendiqAuth', isAuthenticated.toString());
  }, [isAuthenticated]);

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
      console.error('[Auth] Error checking setup status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(profile: Omit<UserProfile, 'id'>) {
    try {
      const newUser = await userRepo.create(profile);
      setUser(newUser);
      setIsSetupComplete(true);
      setShowWelcome(true);
      console.log('[Auth] User created, showing welcome screen');
      
      // Auto-authenticate after 3 seconds
      setTimeout(() => {
        setIsAuthenticated(true);
        setShowWelcome(false);
        console.log('[Auth] Auto-authenticated');
      }, 3000);
    } catch (error) {
      console.error('[Auth] Error creating user:', error);
      throw error;
    }
  }

  async function updateUser(updates: Partial<Omit<UserProfile, 'id' | 'pinHash'>>) {
    try {
      if (!user) {
        throw new Error('No user to update');
      }
      
      const updatedUser = { ...user, ...updates };
      await userRepo.update(updatedUser);
      setUser(updatedUser);
      console.log('[Auth] User profile updated');
    } catch (error) {
      console.error('[Auth] Error updating user:', error);
      throw error;
    }
  }

  async function authenticate(pin: string): Promise<boolean> {
    try {
      if (!user) {
        console.error('[Auth] No user profile found');
        return false;
      }
      
      const isValid = await verifyPIN(pin, user.pinHash);
      
      if (isValid) {
        setIsAuthenticated(true);
        console.log('[Auth] Authentication successful');
        return true;
      }
      
      console.log('[Auth] Authentication failed - incorrect PIN');
      return false;
    } catch (error) {
      console.error('[Auth] Authentication error:', error);
      return false;
    }
  }

  function logout() {
    setIsAuthenticated(false);
    localStorage.removeItem('calendiqAuth');
    console.log('[Auth] User logged out');
  }

  function hideWelcome() {
    setShowWelcome(false);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isSetupComplete,
        loading,
        showWelcome,
        createUser,
        updateUser,
        authenticate,
        logout,
        hideWelcome,
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
