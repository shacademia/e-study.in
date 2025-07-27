'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading Questions",
  subMessage = "Please wait while we fetch your question bank..."
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div>
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">{subMessage}</p>
        </div>
      </div>
    </div>
  );
};
