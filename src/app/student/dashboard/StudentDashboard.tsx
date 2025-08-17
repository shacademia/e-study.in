"use client";
import React, { useState, useEffect } from "react";
import {
  DashboardHeader,
  WelcomeSection,
  StatsCards,
  ProfilePerformance,
  ExamsSection,
  LoadingSpinner,
} from "./components";
import { useDashboardData, useDashboardActions } from "./hooks";

const StudentDashboard: React.FC = () => {
  const {
    userRanking,
    loading,
    userStats,
    availableExams,
    completedExams,
    user,
  } = useDashboardData();

  const { handleStartExam, handleViewResults, handleRankingsClick } =
    useDashboardActions();

  // Add timeout for loading state
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !loadingTimeout) {
    return <LoadingSpinner />;
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg">Loading timeout</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRankingsClick={handleRankingsClick} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-8 py-5">
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
