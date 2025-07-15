import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-id="87jolbmmr" data-path="src/components/supabase/ProtectedRoute.tsx">
        <Card className="p-8 flex flex-col items-center space-y-4" data-id="ikj6m5wfu" data-path="src/components/supabase/ProtectedRoute.tsx">
          <Loader2 className="h-8 w-8 animate-spin" data-id="z1e7gzsld" data-path="src/components/supabase/ProtectedRoute.tsx" />
          <p className="text-sm text-muted-foreground" data-id="4h4dzry6y" data-path="src/components/supabase/ProtectedRoute.tsx">Loading...</p>
        </Card>
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace data-id="ny2ckcgms" data-path="src/components/supabase/ProtectedRoute.tsx" />;
  }

  if (requireAdmin && userProfile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace data-id="go91ygc7o" data-path="src/components/supabase/ProtectedRoute.tsx" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;