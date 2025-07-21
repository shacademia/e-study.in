'use client';

import { AuthProvider } from '@/hooks/useApiAuth';
import { Toaster } from '@/components/ui/toaster';

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
