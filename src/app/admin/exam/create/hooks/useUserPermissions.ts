import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';
import { User } from '@/constants/types';

export const useUserPermissions = () => {
  const [userPermissions, setUserPermissions] = useState({
    canCreateQuestions: false,
    userRole: 'UNKNOWN',
    isActive: false,
    hasToken: false
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const token = authService.getToken();

        if (!token) {
          setUserPermissions({
            canCreateQuestions: false,
            userRole: 'NO_TOKEN',
            isActive: false,
            hasToken: false
          });
          return;
        }

        const userProfile = await authService.getCurrentUser();
        const isActive = (userProfile as User & { isActive?: boolean }).isActive !== false;
        const canCreate = isActive && ['ADMIN', 'MODERATOR'].includes(userProfile.role);

        setUserPermissions({
          canCreateQuestions: canCreate,
          userRole: userProfile.role,
          isActive: isActive,
          hasToken: true
        });
      } catch (error) {
        console.error('Permission check failed:', error);
        setUserPermissions({
          canCreateQuestions: false,
          userRole: 'ERROR',
          isActive: false,
          hasToken: !!authService.getToken()
        });
      }
    };

    checkPermissions();
  }, []);

  return userPermissions;
};
