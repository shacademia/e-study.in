import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useMockAuth.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const MockProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-id="lk2ru5s7f" data-path="src/components/MockProtectedRoute.tsx">
        <Card className="w-full max-w-md" data-id="7r4bzcblp" data-path="src/components/MockProtectedRoute.tsx">
          <CardContent className="flex flex-col items-center justify-center p-8" data-id="gja3b5s37" data-path="src/components/MockProtectedRoute.tsx">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" data-id="ax1446pr7" data-path="src/components/MockProtectedRoute.tsx" />
            <p className="mt-4 text-sm text-muted-foreground" data-id="v0jto7kth" data-path="src/components/MockProtectedRoute.tsx">Loading...</p>
          </CardContent>
        </Card>
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" replace data-id="i937ar8mb" data-path="src/components/MockProtectedRoute.tsx" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace data-id="t1jim3txo" data-path="src/components/MockProtectedRoute.tsx" />;
  }

  return <>{children}</>;
};

export default MockProtectedRoute;