"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authService } from "@/services";
import { User, LoginRequest, SignupRequest, ApiError } from "@/constants/types";
import { useToast } from "@/hooks/use-toast";
import { EmailVerificationModal } from "@/components/modal/verificationModel";
import { useRouter } from "next/navigation";

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
    // const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [emailForVerification, setEmailForVerification] = useState<
    string | null
  >(null);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
    } catch {
      setUser(null);
      toast({
        title: "Info",
        description: "Logged out locally",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      // If email was previously unverified and now verified, close modal
      if (currentUser.isEmailVerified) {
        setShowEmailVerificationModal(false);
        setEmailForVerification(null);
      }
    } catch {
      await logout();
      toast({
        title: "Info",
        description: "Session expired, please log in again.",
      });
      setUser(null);
    }
  }, [logout, toast]);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);

      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      const currentUser = await authService.getCurrentUser();

      if (currentUser.isEmailVerified === false) {
        setUser(currentUser); // optional: keep user in context but treat as not fully authenticated
        toast({
          title: "Info",
          description: "Please verify your email address.",
        });
        setEmailForVerification(currentUser.email);
        setShowEmailVerificationModal(true);
        return;
      }

      setUser(currentUser);
    } catch {
      setUser(null);
      authService.clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [refreshUser, toast]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        setLoading(true);
        const authResponse = await authService.login(data);
        setUser(authResponse.user);

        if (authResponse.user.isEmailVerified === false) {
          toast({
            title: "Info",
            description: "Please verify your email address.",
          });
          setEmailForVerification(authResponse.user.email);
          setShowEmailVerificationModal(true);
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      } catch (error) {
        const apiError = error as ApiError;
        toast({
          title: "Error",
          description: apiError.error || "Failed to login",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      try {
        setLoading(true);
        await authService.signup(data);
        toast({
          title: "Success",
          description: "Account created successfully! Please log in.",
        });
      } catch (error) {
        const apiError = error as ApiError;
        toast({
          title: "Error",
          description: apiError.error || "Failed to create account",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const isAuthenticated = useMemo(
    () => !!user && user.isEmailVerified && authService.isAuthenticated(),
    [user]
  );

  const handleVerificationSuccess = useCallback(() => {
    // refreshUser will close modal if verified
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextType = {
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
      {showEmailVerificationModal && emailForVerification && (
        <EmailVerificationModal
          isOpen={true}
          userEmail={emailForVerification}
          onVerificationSuccess={handleVerificationSuccess}
          onClose={async () => {
            setShowEmailVerificationModal(false);
            setEmailForVerification(null);
            // If user is not verified, log them out
            await logout();
            router.push('/login');
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
