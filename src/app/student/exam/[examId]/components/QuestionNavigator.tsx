import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Bookmark, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionNavigatorProps } from "../types";
import { Question } from "@/constants/types";

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  exam,
  currentQuestionIndex,
  currentSectionIndex,
  questionStatuses,
  onQuestionSelect,
  hasMultipleSections,
  answeredCount,
  markedForReviewCount,
  totalQuestions,
  timeLeft,
  formatTime,
}) => {
  // Get question status color and icon
  const getQuestionStatusStyle = (status: string, isAnswered: boolean) => {
    if (status === "ANSWERED" || isAnswered) {
      return {
        bgColor: "bg-green-100 hover:bg-green-200 border-green-300",
        textColor: "text-green-800",
        icon: <CheckCircle className="h-3 w-3" />,
      };
    } else if (status === "MARKED_FOR_REVIEW") {
      return {
        bgColor: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300",
        textColor: "text-yellow-800",
        icon: <Bookmark className="h-3 w-3" />,
      };
    } else {
      return {
        bgColor: "bg-gray-100 hover:bg-gray-200 border-gray-300",
        textColor: "text-gray-600",
        icon: <Circle className="h-3 w-3" />,
      };
    }
  };

  // Render question grid for a section
  const renderQuestionGrid = (questions: Question[], sectionIndex: number = 0) => {
    return (
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, qIndex) => {
          const questionStatus = questionStatuses[question.id];
          const isAnswered = questionStatus?.answer !== undefined;
          const status = questionStatus?.status || "NOT_ANSWERED";
          const isCurrentQuestion = currentQuestionIndex === qIndex && currentSectionIndex === sectionIndex;
          
          const { bgColor, textColor, icon } = getQuestionStatusStyle(status, isAnswered);

          return (
            <Button
              key={question.id}
              variant="outline"
              size="sm"
              className={cn(
                "h-10 w-10 p-0 relative transition-all duration-200",
                bgColor,
                textColor,
                isCurrentQuestion && "ring-2 ring-blue-500 ring-offset-2",
                "flex flex-col items-center justify-center gap-0.5"
              )}
              onClick={() => onQuestionSelect(sectionIndex, qIndex)}
            >
              <div className="flex items-center justify-center">
                {icon}
              </div>
              <span className="text-xs font-medium">
                {qIndex + 1}
              </span>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Answered:</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {answeredCount}/{totalQuestions}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Marked for Review:</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              {markedForReviewCount}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time Left:</span>
            <Badge 
              variant="outline" 
              className={cn(
                timeLeft <= 300 ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
              )}
            >
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Legend:</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                <CheckCircle className="h-2.5 w-2.5 text-green-600" />
              </div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center">
                <Bookmark className="h-2.5 w-2.5 text-yellow-600" />
              </div>
              <span className="text-gray-600">Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                <Circle className="h-2.5 w-2.5 text-gray-600" />
              </div>
              <span className="text-gray-600">Not Answered</span>
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="space-y-4">
          {hasMultipleSections && exam?.sections ? (
            // Multi-section exam
            exam.sections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    {section.name || `Section ${sectionIndex + 1}`}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      currentSectionIndex === sectionIndex 
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-gray-50"
                    )}
                  >
                    {section.questions?.length || 0} Questions
                  </Badge>
                </div>
                {section.questions && section.questions.length > 0 && (
                  renderQuestionGrid(section.questions, sectionIndex)
                )}
              </div>
            ))
          ) : (
            // Single section exam
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Questions</h4>
              {exam?.questions && exam.questions.length > 0 && (
                renderQuestionGrid(exam.questions, 0)
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Overall Progress</span>
            <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "bg-blue-600 h-2 rounded-full transition-all duration-300",
                // Use dynamic width classes based on progress percentage
                {
                  "w-0": (answeredCount / totalQuestions) * 100 === 0,
                  "w-1/12": (answeredCount / totalQuestions) * 100 > 0 && (answeredCount / totalQuestions) * 100 <= 8,
                  "w-1/6": (answeredCount / totalQuestions) * 100 > 8 && (answeredCount / totalQuestions) * 100 <= 17,
                  "w-1/4": (answeredCount / totalQuestions) * 100 > 17 && (answeredCount / totalQuestions) * 100 <= 25,
                  "w-1/3": (answeredCount / totalQuestions) * 100 > 25 && (answeredCount / totalQuestions) * 100 <= 33,
                  "w-2/5": (answeredCount / totalQuestions) * 100 > 33 && (answeredCount / totalQuestions) * 100 <= 42,
                  "w-1/2": (answeredCount / totalQuestions) * 100 > 42 && (answeredCount / totalQuestions) * 100 <= 50,
                  "w-3/5": (answeredCount / totalQuestions) * 100 > 50 && (answeredCount / totalQuestions) * 100 <= 58,
                  "w-2/3": (answeredCount / totalQuestions) * 100 > 58 && (answeredCount / totalQuestions) * 100 <= 67,
                  "w-3/4": (answeredCount / totalQuestions) * 100 > 67 && (answeredCount / totalQuestions) * 100 <= 75,
                  "w-4/5": (answeredCount / totalQuestions) * 100 > 75 && (answeredCount / totalQuestions) * 100 <= 83,
                  "w-5/6": (answeredCount / totalQuestions) * 100 > 83 && (answeredCount / totalQuestions) * 100 <= 92,
                  "w-11/12": (answeredCount / totalQuestions) * 100 > 92 && (answeredCount / totalQuestions) * 100 < 100,
                  "w-full": (answeredCount / totalQuestions) * 100 === 100,
                }
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigator;
