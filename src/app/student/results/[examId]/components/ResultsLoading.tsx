import React from 'react';

const ResultsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-0">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">Loading results...</p>
      </div>
    </div>
  );
};

export default ResultsLoading;
