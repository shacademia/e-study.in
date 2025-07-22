'use client';
import React from 'react';
import { useAuth } from '@/hooks/useApiAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, Moon } from 'lucide-react';
import { Label } from '@/components/ui/label';

const SettingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center">
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
            <CardTitle className="text-xl flex items-center">
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
            <CardTitle className="text-xl flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label className="font-medium">Change Password</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Update your password to keep your account secure
              </p>
              <Button variant="outline">Change Password</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end mt-8">
          <Button variant="default">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
