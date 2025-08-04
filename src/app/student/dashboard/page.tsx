'use client';

import React, { useEffect } from 'react';
import StudentDashboard from './StudentDashboard';
import { useAuth } from '@/hooks/useApiAuth';

const StudentDashboardPage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log('Dashboard Page - Auth State:', { user: !!user, loading, isAuthenticated });
  }, [user, loading, isAuthenticated]);

  return <StudentDashboard />;
};

export default StudentDashboardPage;