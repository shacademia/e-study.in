"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services';
import { User, LoginRequest, SignupRequest, ApiError } from '@/constants/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // First check if we have a token
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      // Try to get stored user data first (faster)
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        
        // Optionally refresh user data in background
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          // If refresh fails, keep the stored user data
          // Only clear if the token is completely invalid
        }
      } else {
        // No stored user, try to fetch from API
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch {
      // User is not authenticated or token is invalid
      setUser(null);
      // Clear auth data when token is invalid
      authService.clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on external state

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Include checkAuthStatus in dependency array

  const login = useCallback(async (data: LoginRequest) => {
    try {
      setLoading(true);
      const authResponse = await authService.login(data);
      setUser(authResponse.user);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error',
        description: apiError.error || 'Failed to login',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signup = useCallback(async (data: SignupRequest) => {
    try {
      setLoading(true);
      await authService.signup(data);
      // Note: Signup doesn't automatically log in, user needs to login separately
      
      toast({
        title: 'Success',
        description: 'Account created successfully! Please log in.',
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: 'Error',
        description: apiError.error || 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      
      toast({
        title: 'Success',
        description: 'Logged out successfully!',
      });
    } catch {
      // Even if logout API fails, clear local state
      setUser(null);
      
      toast({
        title: 'Info',
        description: 'Logged out locally',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // If refresh fails, user might be logged out
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user && authService.isAuthenticated();

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
