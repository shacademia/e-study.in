'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';

const ResultsHeader: React.FC = () => {
  const router = useRouter();

  return (
    <header className="bg-white w-full shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student/dashboard')}
              className="mr-2 sm:mr-4 cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 p-3 sm:px-3 sm:py-2"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline text-xs sm:text-sm">Back to Dashboard</span>
              <span className="inline sm:hidden text-xs">Dashboard</span>
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
              <span className="hidden sm:inline">Exam Results</span>
              <span className="inline sm:hidden">Results</span>
            </h1>
          </div>
          
          <div className="flex items-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/rankings')}
              className="cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 p-3 sm:px-3 sm:py-2"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline text-xs sm:text-sm">View Ranking</span>
              <span className="inline sm:hidden text-xs">Ranking</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResultsHeader;
