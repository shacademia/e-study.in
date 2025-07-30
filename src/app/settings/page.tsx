'use client';

import React from 'react';
import { useAuth } from '@/hooks/useApiAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Moon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const isValid =
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!currentPassword || !newPassword || !confirmPassword) {
    setError('All password fields are required.');
    return;
  }

  if (newPassword.length < 8) {
    setError('New password must be at least 8 characters.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setError('New passwords do not match.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include', // Ensure cookies are sent if using session auth
    });

    const result = await response.json();

    if (!response.ok) {
      // Prefer specific messages from server
      if (result?.message) {
        setError(result.message);
      } else if (result?.errors) {
        const zodMessages = result.errors?.issues?.map((i: any) => i.message).join(', ');
        setError(zodMessages || 'Invalid form input.');
      } else {
        setError('Unexpected error occurred. Please retry.');
      }
      return;
    }

    setSuccess(result.message || 'Password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (err: any) {

    console.error('Error changing password:', err);
    // Final fallback (e.g., network error, fetch failed)
    setError(err?.message || 'Could not connect to server. Try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="current-password">Current Password</Label>
        <Input
          type="password"
          id="current-password"
          className="mt-1"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <Label htmlFor="new-password">New Password</Label>
        <Input
          type="password"
          id="new-password"
          className="mt-1"
          placeholder="Enter new password (min. 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          type="password"
          id="confirm-password"
          className="mt-1"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
          {success}
        </div>
      )}
      <Button type="submit" variant="default" className="w-full" disabled={!isValid || loading}>
        {loading ? 'Updating Password...' : 'Update Password'}
      </Button>
    </form>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please log in to view settings.</p>
        <Button onClick={() => router.push('/login')} className="ml-4">
          Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() =>
            router.push('/' + (user.role === 'ADMIN' ? 'admin/dashboard' : 'student/dashboard'))
          }
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive exam and result notifications via email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-exam-notifications" className="font-medium">
                  New Exam Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new exams are published
                </p>
              </div>
              <Switch id="new-exam-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Moon className="mr-2 h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="font-medium">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch id="dark-mode" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl">
              <Lock className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <p className="pt-1 text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
