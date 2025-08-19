"use client";
import React from "react";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  // Coffee,
  // AlertTriangle,
  Flag,
} from "lucide-react";
import { ExamHeaderProps } from "../types";

// Updated interface to include onSubmitExam prop
interface UpdatedExamHeaderProps extends ExamHeaderProps {
  onSubmitExam: () => void;
}

const ExamHeader: React.FC<UpdatedExamHeaderProps> = ({
  exam,
  examStarted,
  timeLeft,
  // isOnBreak,
  answeredCount,
  totalQuestions,
  currentSectionIndex,
  // onTakeBreak,
  onSubmitExam,
  getTimeColor,
  formatTime,
}) => {
  // const router = useRouter();

  /**
   * LEAVE EXAM HANDLER
   * Handles user attempting to leave exam via header button
   * Shows confirmation and auto-submits if confirmed
   */
  // const handleBackToDashboard = () => {
  //   // Show confirmation dialog if exam is in progress
  //   if (examStarted && timeLeft > 0) {
  //     const confirmLeave = window.confirm(
  //       "🚨 LEAVE EXAM CONFIRMATION 🚨\n\n" +
  //       "⚠️ WARNING: This will auto-submit your exam!\n\n" +
  //       `📊 Current Progress:\n` +
  //       `• Answered: ${answeredCount}/${totalQuestions} questions\n` +
  //       `• Time remaining: ${formatTime(timeLeft)}\n\n` +
  //       "Are you sure you want to leave? This action cannot be undone.\n\n" +
  //       "✅ Click 'OK' to submit and leave\n" +
  //       "❌ Click 'Cancel' to continue exam"
  //     );
  //     if (!confirmLeave) return;
      
  //     // Trigger submit before leaving (this will handle redirect internally)
  //     onSubmitExam();
  //   } else {
  //     // If exam not started or time is up, direct redirect
  //     onSubmitExam();
  //   }
  // };

  /**
   * MANUAL SUBMIT HANDLER
   * Handles user manually submitting exam via submit button
   * Shows detailed confirmation with progress summary
   */
  const handleSubmitClick = () => {
    const unansweredCount = totalQuestions - answeredCount;
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);
    
    // 🔒 FIX: Add null check for exam.sections
    const sectionsInfo = exam?.sections?.length 
      ? `📍 Current section: ${currentSectionIndex + 1}/${exam.sections.length}\n` 
      : '';
    
    const confirmSubmit = window.confirm(
      `📝 SUBMIT EXAM CONFIRMATION\n\n` +
      `📊 Your Progress Summary:\n` +
      `✅ Answered: ${answeredCount} questions (${progressPercentage}%)\n` +
      `❌ Unanswered: ${unansweredCount} questions\n` +
      `⏰ Time remaining: ${formatTime(timeLeft)}\n` +
      sectionsInfo + // Safe to use since we checked above
      `\n⚠️ Once submitted, you cannot return to modify answers.\n\n` +
      `Are you ready to submit your exam?`
    );
    
    if (confirmSubmit) {
      onSubmitExam();
    }
  };

  // 🔒 FIX: Return null if exam data is not available
  if (!exam) return null;

  return (
    <header className="shadow-lg border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* div:1 Exam title*/}
          <div className="">
            <h1 className="ml-2 md:ml-1 text-md sm:text-lg md:text-xl font-bold text-gray-900 leading-[1.3]" title={exam.name}>
              {exam.name}
            </h1>
          </div>

          {/* div:2 CENTER SECTION - Timer display (most important info) */}
          {examStarted && (
            <div className="flex-shrink-0 mx-2 sm:mx-4 hidden sm:inline">
              <div className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base lg:text-lg border-2 flex items-center shadow-sm ${getTimeColor()}`}>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 lg:mr-3 flex-shrink-0" />
                <span className="font-mono text-xs sm:text-sm lg:text-base" title={`Time remaining: ${formatTime(timeLeft)}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* div:3 RIGHT SECTION - Progress indicators and action buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Progress Badges (hidden on small screens) */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Questions answered badge */}
              <Badge 
                variant="outline" 
                className={`text-xs ${answeredCount === totalQuestions 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
                title={`${answeredCount} out of ${totalQuestions} questions answered`}
              >
                Answered {answeredCount}/{totalQuestions}
              </Badge>

              {/* 🔒 FIX: Section progress badge with proper null checking */}
              {exam.sections && exam.sections.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                  title={`Section ${currentSectionIndex + 1} of ${exam.sections.length}`}
                >
                  Section {currentSectionIndex + 1}/{exam.sections.length}
                </Badge>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Take Break Button */}
              {/* <Button
                variant="outline"
                size="sm"
                className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                onClick={onTakeBreak}
                disabled={isOnBreak}
                title={isOnBreak ? "Break is active" : "Take a break"}
              >
                <Coffee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden md:inline">
                  {isOnBreak ? "On Break" : "Take Break"}
                </span>
                <span className="md:hidden">
                  {isOnBreak ? "Break" : "Break"}
                </span>
              </Button> */}

              {/* Submit Exam Button - Primary action */}
              <Button
                onClick={handleSubmitClick}
                className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 lg:px-6"
                size="sm"
                title="Submit your exam"
              >
                <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden md:inline">Submit Exam</span>
                <span className="md:hidden">Submit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE PROGRESS BAR - Shows progress info on medium and smaller screens */}
        <div className="lg:hidden pb-2 sm:pb-3 pt-1">
          <div className="flex items-center justify-between text-xs sm:text-sm gap-2 px-3 sm:px-4">
            {/* Mobile answered questions badge */}
            <Badge 
              variant="outline" 
              className={`text-xs flex-shrink-0 ${answeredCount === totalQuestions 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <span className="hidden sm:inline">{answeredCount}/{totalQuestions} Answered</span>
              <span className="sm:hidden"> Ans {answeredCount}/{totalQuestions}</span>
            </Badge>

            {/* small scn view */}
            {examStarted && (
              <div className="flex-shrink-0 mx-2 sm:mx-4 sm:hidden">
                <div className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base lg:text-lg border-2 flex items-center shadow-sm ${getTimeColor()}`}>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 lg:mr-3 flex-shrink-0" />
                  <span className="font-mono text-xs sm:text-sm lg:text-base" title={`Time remaining: ${formatTime(timeLeft)}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}

            {/* 🔒 FIX: Mobile section badge with proper null checking */}
            {exam.sections && exam.sections.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs flex-shrink-0">
                <span className="hidden sm:inline">Section {currentSectionIndex + 1}/{exam.sections.length}</span>
                <span className="sm:hidden">Sec {currentSectionIndex + 1}/{exam.sections.length}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
