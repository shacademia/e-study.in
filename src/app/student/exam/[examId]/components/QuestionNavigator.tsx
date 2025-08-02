import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, CheckCircle, Bookmark, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionNavigatorProps } from "../types"; // Assuming this path is correct
import { Question } from "@/constants/types"; // Assuming this path is correct

// Type definitions for the helper component
interface StatusItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badgeClassName?: string;
}

// Helper component for the stats/legend block
const StatusItem: React.FC<StatusItemProps> = ({ icon, label, value, badgeClassName }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
    </div>
    <Badge variant="secondary" className={cn("font-mono", badgeClassName)}>
      {value}
    </Badge>
  </div>
);

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
  // Function to get styles for question buttons
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

  // Function to render the grid of question buttons
  const renderQuestionGrid = (questions: Question[], sectionIndex: number = 0) => {
    return (
      <div className="grid grid-cols-5 gap-2 pt-2">
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
              <div className="flex items-center justify-center">{icon}</div>
              <span className="text-xs font-medium">{qIndex + 1}</span>
            </Button>
          );
        })}
      </div>
    );
  };
  
  // Calculate derived values for the UI
  const notAnsweredCount = totalQuestions - answeredCount - markedForReviewCount;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Progress</CardTitle>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1 text-base font-mono font-bold",
            // Using your updated color choice for the timer
            timeLeft <= 300
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          )}
        >
          <Clock className="h-5 w-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2 rounded-lg border bg-gray-50/50 p-3 dark:bg-zinc-800/20 dark:border-zinc-700">
          <StatusItem
            icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            label="Answered"
            value={`${answeredCount}`}
            badgeClassName="bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-300"
          />
          <StatusItem
            icon={<Bookmark className="h-4 w-4 text-yellow-500" />}
            label="Marked for Review"
            value={markedForReviewCount}
            badgeClassName="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300"
          />
          <StatusItem
            icon={<Circle className="h-4 w-4 text-gray-500" />}
            label="Not Answered"
            value={notAnsweredCount}
            badgeClassName="bg-gray-100/50 text-gray-600 dark:text-gray-400"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Overall Progress ({answeredCount}/{totalQuestions})</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {hasMultipleSections && exam?.sections ? (
            <Accordion
              type="multiple"
              defaultValue={exam.sections.map((_, index) => `section-${index}`)}
              className="w-full"
            >
              {exam.sections.map((section, sectionIndex) => (
                <AccordionItem key={section.id || sectionIndex} value={`section-${sectionIndex}`} className="border-b-0">
                  <AccordionTrigger className="hover:no-underline py-3 rounded-md px-2 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800/50">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 text-left pl-[3px]">
                        {section.name || `Section ${sectionIndex + 1}`}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          // Using your updated margin class
                          "text-xs mr-1 text-center",
                          currentSectionIndex === sectionIndex
                            ? "bg-blue-50/60 text-blue-700 border-blue-200"
                            : "bg-gray-200/60"
                        )}
                      >
                        {section.questions?.length || 0} Questions
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-1">
                    {section.questions && section.questions.length > 0 ? (
                      renderQuestionGrid(section.questions, sectionIndex)
                    ) : (
                      <p className="text-sm text-muted-foreground pt-2">No questions in this section.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Questions</h4>
              {exam?.questions && exam.questions.length > 0 ? (
                renderQuestionGrid(exam.questions, 0)
              ) : (
                 <p className="text-sm text-muted-foreground">No questions available.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigator;
