import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/types/user';
import { IndexedDBUserRepository } from '@/db/repositories';
import { verifyPIN } from '@/lib/hashUtils';

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
      setIsAuthenticated(true);
      console.log('[Auth] User created and authenticated');
    } catch (error) {
      console.error('[Auth] Error creating user:', error);
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
    console.log('[Auth] User logged out');
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
