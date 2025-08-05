"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAuth } from "@/hooks/useApiAuth";
import { LoginRequest, SignupRequest } from "@/constants/types";
import { promise } from "zod";

/* -------------------------------------------------------------------------- */
/*                                    UI                                      */
/* -------------------------------------------------------------------------- */

const ErrorAlert: React.FC<{ message: string; id?: string }> = ({
  message,
  id,
}) => (
  <Alert
    id={id}
    className="mt-2 border-red-200 bg-red-50 text-red-800 flex gap-2"
  >
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">{message}</AlertDescription>
  </Alert>
);

const SuccessAlert: React.FC<{ message: string }> = ({ message }) => (
  <Alert className="mt-4 border-green-200 bg-green-50 text-green-800 flex gap-2">
    <AlertCircle className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-green-800">{message}</AlertDescription>
  </Alert>
);

/* -------------------------------------------------------------------------- */
/*                               Page Component                               */
/* -------------------------------------------------------------------------- */

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, signup, user, loading, isAuthenticated } = useAuth();

  /* ------------------------------ Local state ----------------------------- */
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);

  /* Password visibility */
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Forms */
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState<
    SignupRequest & { confirmPassword: string }
  >({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ------------------------------ Side-effects ---------------------------- */
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(
        user.role === "ADMIN" || "MODERATOR" ? "/admin/dashboard" : "/student/dashboard"
      );
    }
  }, [isAuthenticated, user, router]);

  /* ----------------------------- Validation ------------------------------- */
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    } else if (loginData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signUpData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signUpData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(signUpData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signUpData.password) {
      newErrors.password = "Password is required";
    } else if (signUpData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------------ Handlers -------------------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setSubmitting(true);
    try {
      
      await login(loginData);
    } catch {
      setErrors({ general: "Login failed. Check your credentials." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setSubmitting(true);
    try {
      const { email, password } = signUpData;
      await signup({ name: signUpData.name.trim(), phoneNumber: signUpData.phoneNumber.trim(), email: email.trim(), password });
      setSignUpData({ name: '', phoneNumber: '', email: "", password: "", confirmPassword: "" });
      setActiveTab("login");
      setErrors({ success: "Account created successfully! Please log in." });
    } catch {
      setErrors({ general: "Account creation failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setErrors({ forgotPassword: "Email is required" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      setErrors({ forgotPassword: "Please enter a valid email" });
      return;
    }

    setForgotPasswordSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();
      
      if (data.success) {
        setErrors({ forgotPasswordSuccess: data.message });
        setForgotPasswordEmail("");
        setShowForgotPassword(false);
      } else {
        setErrors({ forgotPassword: data.error || "Failed to send reset email" });
      }
    } catch {
      setErrors({ forgotPassword: "Failed to send reset email. Please try again." });
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  /* ---------------------------- Early returns ----------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  /* ------------------------------ JSX Markup ------------------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">ExamPortal</CardTitle>
          <CardDescription>Advanced Exam Management System</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as "login" | "signup");
              setErrors({});
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* General feedback */}
            {errors.general && <ErrorAlert message={errors.general} />}
            {errors.success && <SuccessAlert message={errors.success} />}

            {/* ----------------------------- Log In ---------------------------- */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Log In</CardTitle>
                  <CardDescription>Access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <ErrorAlert
                          message={errors.email}
                          id="login-email-error"
                        />
                      )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showLoginPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {errors.password && (
                        <ErrorAlert
                          message={errors.password}
                          id="login-password-error"
                        />
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in…
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password Section - Outside of main form */}
                  <div className="mt-4">
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setShowForgotPassword(!showForgotPassword);
                          setErrors({});
                        }}
                      >
                        Forgot your password?
                      </Button>
                    </div>

                    {/* Forgot Password Form */}
                    {showForgotPassword && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <h3 className="text-sm font-medium mb-2">Reset Password</h3>
                        <form onSubmit={handleForgotPassword} className="space-y-3">
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              required
                            />
                          </div>
                          {errors.forgotPassword && (
                            <ErrorAlert message={errors.forgotPassword} />
                          )}
                          {errors.forgotPasswordSuccess && (
                            <SuccessAlert message={errors.forgotPasswordSuccess} />
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={forgotPasswordSubmitting}
                              className="flex-1"
                            >
                              {forgotPasswordSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                "Send Reset Link"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowForgotPassword(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------------------- Sign Up --------------------------- */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Sign Up</CardTitle>
                  <CardDescription>Create a new account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">

                    {/* Name */}
                    <div className="relative">

                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Name"
                        className="pl-10"
                        value={signUpData.name}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            name: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <ErrorAlert message={errors.name} id="signup-name-error" />
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        className="pl-10"
                        value={signUpData.phoneNumber}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.phoneNumber}
                      />
                      {errors.phoneNumber && (
                        <ErrorAlert
                          message={errors.phoneNumber}
                          id="signup-phone-error"
                        />
                      )}
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            email: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <ErrorAlert
                          message={errors.email}
                          id="signup-email-error"
                        />
                      )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10 pr-10"
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            password: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((p) => !p)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showSignupPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {errors.password && (
                        <ErrorAlert
                          message={errors.password}
                          id="signup-password-error"
                        />
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="pl-10 pr-10"
                        value={signUpData.confirmPassword}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {errors.confirmPassword && (
                        <ErrorAlert
                          message={errors.confirmPassword}
                          id="confirm-password-error"
                        />
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
