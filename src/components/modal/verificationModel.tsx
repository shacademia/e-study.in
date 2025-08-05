// src/components/EmailVerificationModal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userService, ApiError } from "@/services";
import { Mail, Shield, CheckCircle } from "lucide-react";

interface EmailVerificationModalProps {
  isOpen: boolean;
  userEmail: string;
  onVerificationSuccess: () => void;
  onClose: () => void;
}

export function EmailVerificationModal({
  isOpen,
  userEmail,
  onVerificationSuccess,
  onClose,
}: EmailVerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  
  const { toast } = useToast();

  // Handle sending verification email
  const handleSendVerification = async () => {
    try {
      setSendLoading(true);
      await userService.sendEmailVerification({ userEmail });
      setIsVerificationSent(true);
      toast({
        title: "Verification Email Sent",
        description:
          "Please check your email for the 6-digit verification code.",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  // Handle code verification
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await userService.verifyEmail(verificationCode);
      toast({
        title: "Success",
        description: "Email verified successfully!",
      });
      onVerificationSuccess();
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset modal state when closed and reopened
  React.useEffect(() => {
    if (isOpen) {
      setVerificationCode("");
      setIsVerificationSent(false);
      setIsLoading(false);
      setSendLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && onClose) onClose(); // 🔥 Call it only when closing
      }}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Email Verification Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Please verify your email address to continue
            </p>
            <p className="text-blue-600 font-medium text-sm">{userEmail}</p>
          </div>

          {!isVerificationSent ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Verification Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Your email address needs to be verified before you can
                        access this application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendVerification}
                disabled={sendLoading}
                className="w-full"
                size="lg"
              >
                {sendLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Verification Email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Email
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Verification Email Sent
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Please check your email inbox and enter the 6-digit code
                        below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Code expires in 10 minutes
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSendVerification}
                  disabled={sendLoading}
                  className="w-full"
                >
                  {sendLoading ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            <p>You must verify your email to continue using the application.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
