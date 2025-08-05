'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/auth';
import { toast } from '@/hooks/use-toast';
import { User, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role: string;
  isActive: boolean;
}

const UserDebugInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);
  const [rawUserData, setRawUserData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Check if token exists
    const token = authService.getToken();
    setTokenExists(!!token);
    
    // Get stored user data
    const userData = authService.getUser();
    setRawUserData(userData as Record<string, unknown> | null);
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const profile = await authService.getCurrentUser();
      // Check if the profile has isActive property, default to true if not
      const profileWithActive = profile as typeof profile & { isActive?: boolean };
      const isActive = profileWithActive.isActive !== false; // Default to true if not specified
      
      const userInfo: UserInfo = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        isActive: isActive
      };
      setUserInfo(userInfo);
      toast({
        title: "Profile fetched successfully",
        description: `User: ${profile.email}, Role: ${profile.role}`,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({
        title: "Failed to fetch profile",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canCreateQuestions = (role: string, isActive: boolean) => {
    return isActive && ['ADMIN', 'MODERATOR'].includes(role?.toUpperCase());
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Authentication Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Status */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Auth Token:</span>
          {tokenExists ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Present
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              Missing
            </Badge>
          )}
        </div>

        {/* Raw User Data */}
        {rawUserData && (
          <div>
            <span className="font-medium">Stored User Data:</span>
            <pre className="mt-2 p-3 bg-gray-100 rounded-md text-xs overflow-auto">
              {JSON.stringify(rawUserData, null, 2)}
            </pre>
          </div>
        )}

        {/* Fetch Profile Button */}
        <Button 
          onClick={fetchUserProfile} 
          disabled={loading || !tokenExists}
          className="w-full cursor-pointer"
        >
          {loading ? 'Fetching...' : 'Fetch Current User Profile'}
        </Button>

        {/* User Info Display */}
        {userInfo && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span>{userInfo.email}</span>
            </div>
            
            {userInfo.name && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Name:</span>
                <span>{userInfo.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Role:</span>
              <Badge className={getRoleColor(userInfo.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {userInfo.role}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Active:</span>
              {userInfo.isActive ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>

            {/* Permission Check */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Can Create Questions:</span>
              {canCreateQuestions(userInfo.role, userInfo.isActive) ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  No - Need ADMIN/MODERATOR role and active account
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>403 Error Troubleshooting:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Ensure you have a valid authentication token</li>
            <li>Your account must be active (isActive: true)</li>
            <li>Your role must be ADMIN or MODERATOR to create questions</li>
            <li>If you&apos;re a STUDENT, you cannot create questions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDebugInfo;
