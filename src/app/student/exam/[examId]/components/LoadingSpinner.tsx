import React from "react";
import { LoadingSpinnerProps } from "../types";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
