'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy } from 'lucide-react';

const ResultsActions: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 w-full px-4 sm:px-0">
      <Button
        variant="outline"
        className="w-full sm:w-auto cursor-pointer text-sm sm:text-base"
        onClick={() => router.push('/student/dashboard')}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Back to Dashboard</span>
        <span className="inline sm:hidden">Dashboard</span>
      </Button>
      <Button
        className="w-full sm:w-auto cursor-pointer text-sm sm:text-base"
        onClick={() => router.push('/rankings')}
      >
        <Trophy className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">View Rankings</span>
        <span className="inline sm:hidden">Rankings</span>
      </Button>
    </div>
  );
};

export default ResultsActions;
