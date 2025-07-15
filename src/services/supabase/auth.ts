import { supabase } from '@/config/supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export interface AuthUser extends User {
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name
      }
    }
  });

  if (error) throw error;

  // Create user profile in users table
  if (data.user) {
    const { error: profileError } = await supabase.
    from('users').
    insert({
      id: data.user.id,
      email: data.user.email!,
      name,
      role: 'student'
    });

    if (profileError) throw profileError;
  }

  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });

  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.
  from('users').
  select('*').
  eq('id', userId).
  single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase.
  from('users').
  update(updates).
  eq('id', userId).
  select().
  single();

  if (error) throw error;
  return data;
};