import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockDataService, User } from '../services/mockData.ts';
import { toast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('mockUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await mockDataService.signIn(email, password);
      setUser(userData);
      localStorage.setItem('mockUser', JSON.stringify(userData));
      toast({
        title: 'Success',
        description: 'Signed in successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userData = await mockDataService.signUp(email, password, name);
      setUser(userData);
      localStorage.setItem('mockUser', JSON.stringify(userData));
      toast({
        title: 'Success',
        description: 'Account created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await mockDataService.signOut();
      setUser(null);
      localStorage.removeItem('mockUser');
      toast({
        title: 'Success',
        description: 'Signed out successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }} data-id="xbsm0a452" data-path="src/hooks/useMockAuth.tsx">
      {children}
    </AuthContext.Provider>);

};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};