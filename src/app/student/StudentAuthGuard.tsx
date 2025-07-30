"use client";

import { useAuth } from "@/hooks/useApiServices";
import { useEffect, useState } from "react";
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

export default function StudentAuthGuard({
  children,
}: StudentAuthGuardProps): React.JSX.Element | null {
  const { getCurrentUser } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<userType | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (hasRedirected) return;

      try {
        const currentUser = await getCurrentUser() as userType | null;

        if (!isMounted || hasRedirected) return;

        // If no user is logged in, redirect to login
        if (!currentUser) {
          setHasRedirected(true);
          router.push("/login");
          return;
        }

        // If user is not a student, redirect appropriately
        if (currentUser.role !== "USER") {
          setHasRedirected(true);
          router.push(currentUser.role === "ADMIN" ? "/admin/dashboard" : "/login");
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        if (!isMounted || hasRedirected) return;
        console.error("Error fetching user:", error);
        setHasRedirected(true);
        router.push("/login");
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

  // At this point, user should always exist and be a student
  // Remove the redundant check and just render children
  return <>{children}</>;
}
