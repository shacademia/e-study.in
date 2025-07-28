import React from "react";
import { BookOpen, Goal, Award, Users } from "lucide-react";
import { StatCard } from "./";
import { StatsCardsProps } from "../types";

const StatsCards: React.FC<StatsCardsProps> = ({ stats, userRanking }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Exams Attended"
        value={stats?.totalExamsAttended || 0}
        subtitle="Total completed"
        icon={<BookOpen className="h-4 w-4" />}
        colorScheme="blue"
      />
      
      <StatCard
        title="Highest Score"
        value={stats?.highestScore || 0}
        subtitle="Best performance"
        icon={<Goal className="h-4 w-4" />}
        colorScheme="green"
      />
      
      <StatCard
        title="Current Rank"
        value={userRanking?.globalRank ? `#${userRanking?.globalRank}` : 'N/A'}
        subtitle="Among students"
        icon={<Award className="h-4 w-4" />}
        colorScheme="purple"
      />
      
      <StatCard
        title="Total Students"
        value={stats?.totalStudents || 0}
        subtitle="In the system"
        icon={<Users className="h-4 w-4" />}
        colorScheme="orange"
      />
    </div>
  );
};

export default StatsCards;
