'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useApiAuth';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { toast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  onQuestionBankClick: () => void;
  onRankingsClick: () => void;
  onUsersClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onQuestionBankClick, 
  onRankingsClick,
  onUsersClick 
}) => {
  const { user } = useAuth();

  console.log('This is the data From dashboard', user)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onQuestionBankClick}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Question Bank
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onRankingsClick}
            >
              <Trophy className="h-4 w-4 mr-1" />
              Rankings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onUsersClick}
            >
              <Users className="h-4 w-4 mr-1" />
              Users
            </Button>
            {user && <UserProfileMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
};
