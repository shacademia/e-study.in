import React from 'react';
import { AlertCircle } from 'lucide-react';

const ResultsNotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-0">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
          Results Not Found
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-500">
          The exam results could not be found or you haven&apos;t submitted this exam yet.
        </p>
      </div>
    </div>
  );
};

export default ResultsNotFound;
