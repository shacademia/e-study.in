import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowLeft } from "lucide-react";
import { ExamFilterSelect } from "./";
import { RankingsHeaderProps } from "../types";

const RankingsHeader: React.FC<RankingsHeaderProps> = ({
  selectedExam,
  exams,
  onExamFilterChange,
  onBackNavigation
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackNavigation}
              className="mr-4 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Trophy className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              Student Rankings
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ExamFilterSelect 
              selectedExam={selectedExam}
              exams={exams}
              onExamFilterChange={onExamFilterChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default RankingsHeader;
