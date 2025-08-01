"use client";
import React from 'react';
import { 
  DashboardHeader, 
  WelcomeSection, 
  StatsCards, 
  ProfilePerformance,
  ExamsSection,
  LoadingSpinner 
} from './components';
import { useDashboardData, useDashboardActions } from './hooks';

const StudentDashboard: React.FC = () => {
  const { 
    exams,
    userSubmissions,
    userRanking,
    loading,
    userStats,
    availableExams,
    completedExams,
    user
  } = useDashboardData();
  
  const { 
    handleStartExam, 
    handleViewResults, 
    handleRankingsClick 
  } = useDashboardActions();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRankingsClick={handleRankingsClick} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection userName={user?.name} />
        
        <StatsCards stats={userStats} userRanking={userRanking} />
        
          <div className="lg:col-span-2">
            <ExamsSection
              availableExams={availableExams}
              completedExams={completedExams}
              onStartExam={handleStartExam}
              onViewResults={handleViewResults}
              userStats={userStats}
            />
          </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
