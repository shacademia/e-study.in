import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy } from "lucide-react";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { useAuth } from "@/hooks/useApiAuth";
import { DashboardHeaderProps } from "../types";

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRankingsClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onRankingsClick}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Rankings
            </Button>
            {user && <UserProfileMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
