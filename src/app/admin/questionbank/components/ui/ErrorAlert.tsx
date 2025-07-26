'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  title = "Something went wrong"
}) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>We encountered an error while loading your questions.</p>
          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              Refresh Page
            </Button>
          </div>
          {error && (
            <details className="text-xs mt-2">
              <summary className="cursor-pointer text-muted-foreground">Technical Details</summary>
              <code className="block mt-1 p-2 bg-muted rounded text-xs">{error}</code>
            </details>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
