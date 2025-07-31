"use client";

import { useAuth } from "@/hooks/useApiServices";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "./dashboard/components";

type StudentAuthGuardProps = {
  children: React.ReactNode;
};

type userType = {
  bio: string | null;
  createdAt: string;
  email: string;
  id: string;
  isEmailVerified: boolean;
  name: string;
  phoneNumber: string | null;
  profileImage: string | null;
  role: "ADMIN" | "USER";
  updatedAt: string;
};

export default function StudentAuthGuard({ children }: StudentAuthGuardProps) {
  const { getCurrentUser } = useAuth();
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'redirecting'>('loading');
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple auth checks
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    try {
      const currentUser = await getCurrentUser() as userType;

      if (!currentUser) {
        setAuthState('redirecting');
        router.push("/login");
        return;
      }

      if (currentUser.role !== "USER") {
        setAuthState('redirecting');
        router.push(currentUser.role === "ADMIN" ? "/admin/dashboard" : "/login");
        return;
      }

      setAuthState('authenticated');
    } catch (error) {
      console.error("Error fetching user:", error);
      setAuthState('redirecting');
      router.push("/login");
    }
  }, [router]); // Remove getCurrentUser from dependencies

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authState !== 'authenticated') {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}