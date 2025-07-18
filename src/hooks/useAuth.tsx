import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  onAuthStateChange,
  getUserProfile,
} from '@/services/supabase/auth';
import { useToast } from '@/hooks/use-toast';

// Define a basic shape for user profile (adjust as needed)
interface UserProfile {
  id: string;
  name?: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      await signUpWithEmail(email, password, name);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account."
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      toast({ title: "Signed in successfully" });
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: "Signed out successfully" });
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: "Password reset sent",
        description: "Check your email for reset instructions."
      });
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshProfile
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