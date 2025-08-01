"use client";

import { useAuth } from "@/hooks/useApiServices";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./dashboard/components";

type AdminAuthGuardProps = {
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
  role: "ADMIN" | "STUDENT";
  updatedAt: string;
};

export default function AdminAuthGuard({
  children,
}: AdminAuthGuardProps): React.JSX.Element | null {
  const { getCurrentUser } = useAuth();
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (hasRedirected) return;

      try {
        const currentUser = await getCurrentUser() as userType | null;
        console.log("Current user in AdminAuthGuard:", currentUser);

        if (!isMounted || hasRedirected) return;

        // If no user is logged in, redirect to login
        if (!currentUser) {
          setHasRedirected(true);
          window.location.href = "/login";
          return;
        }

        // If user is not admin, redirect to student dashboard
        if (currentUser.role !== "ADMIN") {
          setHasRedirected(true);
          window.location.href = "/student/dashboard";
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        if (!isMounted || hasRedirected) return;
        console.error("Error fetching user:", error);
        setHasRedirected(true);
        window.location.href = "/login";
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show loading while checking auth or redirecting
  if (loading || hasRedirected) {
    return <LoadingSpinner />;
  }

  // Only render children if user exists and is admin
  if (!user || user.role !== "ADMIN") {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
