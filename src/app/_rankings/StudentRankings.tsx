"use client";
import React from "react";
import { RankingsHeader, TopRankingsSection, ExamRankingsSection, NoRankingsMessage, LoadingSpinner } from "./components";
import { useRankingsData, useRankingsActions } from "./hooks";

const StudentRankings: React.FC = () => {
  const { 
    exams, 
    selectedExam, 
    setSelectedExam,
    loading,
    topRankings,
    rankingsByExam
  } = useRankingsData();
  
  const { handleExamFilterChange, handleBackNavigation } = useRankingsActions(setSelectedExam);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RankingsHeader 
        selectedExam={selectedExam}
        exams={exams}
        onExamFilterChange={handleExamFilterChange}
        onBackNavigation={handleBackNavigation}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {selectedExam === "all" && (
            <TopRankingsSection rankings={topRankings} exams={exams} />
          )}
          
          <ExamRankingsSection 
            rankingsByExam={rankingsByExam}
          />
          
          {Object.keys(rankingsByExam).length === 0 && (
            <NoRankingsMessage selectedExam={selectedExam} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRankings;
