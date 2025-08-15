"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, Flag, AlertTriangle } from "lucide-react";
import { ExamHeaderProps } from "../types";

// Updated interface to include onSubmitExam prop
interface UpdatedExamHeaderProps extends ExamHeaderProps {
  onSubmitExam: () => void;
}

const ExamHeader: React.FC<UpdatedExamHeaderProps> = ({
  exam,
  examStarted,
  timeLeft,
  isOnBreak,
  answeredCount,
  totalQuestions,
  currentSectionIndex,
  onTakeBreak,
  onSubmitExam,
  getTimeColor,
  formatTime,
}) => {
  const router = useRouter();

  /**
   * LEAVE EXAM HANDLER
   * Handles user attempting to leave exam via header button
   * Shows confirmation and auto-submits if confirmed
   */
  const handleBackToDashboard = () => {
    // Show confirmation dialog if exam is in progress
    if (examStarted && timeLeft > 0) {
      const confirmLeave = window.confirm(
        "🚨 LEAVE EXAM CONFIRMATION 🚨\n\n" +
        "⚠️ WARNING: This will auto-submit your exam!\n\n" +
        `📊 Current Progress:\n` +
        `• Answered: ${answeredCount}/${totalQuestions} questions\n` +
        `• Time remaining: ${formatTime(timeLeft)}\n\n` +
        "Are you sure you want to leave? This action cannot be undone.\n\n" +
        "✅ Click 'OK' to submit and leave\n" +
        "❌ Click 'Cancel' to continue exam"
      );
      if (!confirmLeave) return;
      
      // Trigger submit before leaving (this will handle redirect internally)
      onSubmitExam();
    } else {
      // If exam not started or time is up, direct redirect
      onSubmitExam();

      // 🔒 SECURITY: Use replace() to prevent back navigation to exam
      // router.replace('/student/dashboard');
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT SECTION - Leave button and exam information */}
          <div className="flex items-center space-x-4">
            {/* Leave Exam Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-gray-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
              title="Leave exam (will auto-submit)"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leave Exam</span>
              <span className="sm:hidden">Leave</span>
            </Button>
            
            {/* Visual separator */}
            <div className="h-6 w-px bg-gray-300"></div>
            
            {/* Exam title and description */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-md" title={exam.name}>
                {exam.name}
              </h1>
              {exam.description && (
                <p className="text-sm text-gray-500 truncate max-w-md" title={exam.description}>
                  {exam.description}
                </p>
              )}
            </div>
          </div>

          {/* CENTER SECTION - Timer display (most important info) */}
          {examStarted && (
            <div className="flex-shrink-0">
              <div className={`px-6 py-2 rounded-lg font-bold text-lg border-2 flex items-center shadow-sm ${getTimeColor()}`}>
                <Clock className="h-5 w-5 mr-3" />
                <span className="font-mono" title={`Time remaining: ${formatTime(timeLeft)}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}

          {/* RIGHT SECTION - Progress indicators and action buttons */}
          <div className="flex items-center space-x-3">
            
            {/* Progress Badges (hidden on small screens) */}
            <div className="hidden sm:flex items-center space-x-2">
              {/* Questions answered badge */}
              <Badge 
                variant="outline" 
                className={`${answeredCount === totalQuestions 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
                title={`${answeredCount} out of ${totalQuestions} questions answered`}
              >
                {answeredCount}/{totalQuestions} Answered
              </Badge>
              
              {/* 🔒 FIX: Section progress badge with proper null checking */}
              {exam.sections && exam.sections.length > 0 && (
                <Badge 
                  variant="outline" 
                  className="bg-purple-50 text-purple-700 border-purple-200"
                  title={`Section ${currentSectionIndex + 1} of ${exam.sections.length}`}
                >
                  Section {currentSectionIndex + 1}/{exam.sections.length}
                </Badge>
              )}
            </div>

            {/* Action Buttons Container */}
            <div className="flex items-center space-x-2">
              
              {/* Take Break Button */}
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
                onClick={onTakeBreak}
                disabled={isOnBreak}
                title={isOnBreak ? "Break is active" : "Take a break"}
              >
                <Coffee className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {isOnBreak ? "On Break" : "Take Break"}
                </span>
                <span className="sm:hidden">
                  {isOnBreak ? "Break" : "Break"}
                </span>
              </Button>

              {/* Submit Exam Button - Primary action */}
              <Button
                onClick={handleSubmitClick}
                className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
                title="Submit your exam"
              >
                <Flag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Submit Exam</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE PROGRESS BAR - Shows progress info on small screens */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="flex items-center justify-between text-sm">
            {/* Mobile answered questions badge */}
            <Badge 
              variant="outline" 
              className={`${answeredCount === totalQuestions 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {answeredCount}/{totalQuestions} Answered
            </Badge>
            
            {/* 🔒 FIX: Mobile section badge with proper null checking */}
            {exam.sections && exam.sections.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Section {currentSectionIndex + 1}/{exam.sections.length}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
