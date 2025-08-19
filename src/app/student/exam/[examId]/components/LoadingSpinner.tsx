import React from "react";
import { LoadingSpinnerProps } from "../types";

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
        <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 max-w-xs sm:max-w-sm lg:max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
