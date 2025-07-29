'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrors({ general: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <Alert className="mb-4 border-red-200 bg-red-50 text-red-800 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                className="pl-10 pr-10"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                aria-invalid={!!errors.newPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.newPassword && (
                <Alert className="mt-2 border-red-200 bg-red-50 text-red-800 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{errors.newPassword}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                className="pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.confirmPassword && (
                <Alert className="mt-2 border-red-200 bg-red-50 text-red-800 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{errors.confirmPassword}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;