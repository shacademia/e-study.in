import React from 'react';
import { AlertCircle } from 'lucide-react';

const ResultsNotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Results Not Found</h2>
        <p className="text-gray-500">The exam results could not be found or you haven&apos;t submitted this exam yet.</p>
      </div>
    </div>
  );
};

export default ResultsNotFound;
