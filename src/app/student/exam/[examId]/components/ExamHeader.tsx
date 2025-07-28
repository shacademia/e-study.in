import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee } from "lucide-react";
import { ExamHeaderProps } from "../types";

const ExamHeader: React.FC<ExamHeaderProps> = ({
  exam,
  examStarted,
  timeLeft,
  isOnBreak,
  answeredCount,
  totalQuestions,
  currentSectionIndex,
  onTakeBreak,
  getTimeColor,
  formatTime,
}) => {
  if (!exam) return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {exam.name}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {examStarted && (
              <>
                <div className={`px-4 py-2 rounded-lg font-medium border-2 ${getTimeColor()}`}>
                  <Clock className="h-5 w-5 mr-2 inline" />
                  ⏱️ {formatTime(timeLeft)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className='cursor-pointer'
                  onClick={onTakeBreak}
                  disabled={isOnBreak}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Take Break
                </Button>
              </>
            )}
            <Badge variant="outline">
              {answeredCount}/{totalQuestions} Answered
            </Badge>
            {exam.sections && exam.sections.length > 0 && (
              <Badge variant="outline" className="ml-4">
                Section {currentSectionIndex + 1} of {exam.sections.length}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
