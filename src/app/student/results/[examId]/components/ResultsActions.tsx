'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy } from 'lucide-react';

const ResultsActions: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center space-x-4">
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => router.push('/student/dashboard')}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      <Button
        className="cursor-pointer"
        onClick={() => router.push('/rankings')}
      >
        <Trophy className="h-4 w-4 mr-2" />
        View Rankings
      </Button>
    </div>
  );
};

export default ResultsActions;
