import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bookmark, Flag } from "lucide-react";
import { NavigationControlsProps } from "../types";

const NavigationControls: React.FC<NavigationControlsProps> = ({
  isFirstQuestion,
  isLastQuestion,
  onPrevQuestion,
  onNextQuestion,
  onMarkForReview,
  onSubmitExam,
  currentQuestion,
  questionStatuses,
}) => {
  // Check if current question is marked for review
  const isMarkedForReview = currentQuestion 
    ? questionStatuses[currentQuestion.id]?.status === "MARKED_FOR_REVIEW"
    : false;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center pt-2 px-2 sm:px-4 bg-white rounded-lg gap-3 sm:gap-0">
      <div className="flex space-x-2 w-full sm:w-auto">
        <Button
          variant="outline"
          className='cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none'
          onClick={onPrevQuestion}
          disabled={isFirstQuestion}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        <Button
          variant="outline"
          className={`cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none ${isMarkedForReview ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''}`}
          onClick={() =>
            currentQuestion && onMarkForReview(currentQuestion.id)
          }
        >
          <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 ${isMarkedForReview ? 'fill-current text-yellow-500' : ''}`} />
          <span className="hidden sm:inline">{isMarkedForReview ? 'Remove Review' : 'Mark for Review'}</span>
          <span className="sm:hidden">{isMarkedForReview ? 'Remove' : 'Mark'}</span>
        </Button>
      </div>

      <div className="flex space-x-2 w-full sm:w-auto">
        {isLastQuestion ? (
          <Button
            className='cursor-pointer bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-1 sm:flex-none'
            onClick={onSubmitExam}
          >
            <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Submit Exam</span>
            <span className="sm:hidden">Submit</span>
          </Button>
        ) : (
          <Button
            className='cursor-pointer text-xs sm:text-sm flex-1 sm:flex-none'
            onClick={onNextQuestion}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationControls;
