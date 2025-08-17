import React, { memo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play, Lock, HelpCircle, Star, BarChart3, BookOpen, Target, 
  ChevronRight, Clock, Calendar, Sparkles
} from "lucide-react";
import { ExamCardProps } from "../types";
import { formatDate } from "./ExamCards/utils/examUtils";
import StartExamDialog from "./ExamCards/StartExamDialog";
import StatMetric from "./ExamCards/StatMetric";
import ScoreVisualization from "./ExamCards/ScoreVisualization";
import StatusBadge from "./ExamCards/StatusBadge";

const ExamCard: React.FC<ExamCardProps> = memo(({
  exam, submission, isCompleted, onStartExam, onViewResults
}) => {
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  // COMPUTED VALUES
  const scorePercentage = submission?.statistics?.percentage ?? 0;
  const sectionCount = exam.sections?.length ?? 1;
  const questionCount = exam.questions?.length ?? exam.questionsCount ?? 0;

  // EVENT HANDLERS
  const handleStartExam = useCallback(() => {
    setShowStartDialog(false);
    onStartExam(exam.id);
  }, [onStartExam, exam.id]);

  const handleOpenStartDialog = useCallback(() => {
    setShowStartDialog(true);
  }, []);

  const handleViewResults = useCallback(() => (
    submission ? onViewResults(submission.id) : null
  ), [onViewResults, submission]);

  return (
    <Card className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-slate-50/50 to-gray-50/80 border-slate-200/60 shadow-lg transition-all duration-500 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-bl from-blue-100/30 via-transparent to-transparent rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-gradient-to-tr from-emerald-100/30 via-transparent to-transparent rounded-full blur-2xl -z-10" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h2 className="leading-[1.3] text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 flex items-center gap-[10px]">
            <BookOpen className="h-6 w-6 mt-[-5px] md:mt-0 text-slate-500 flex-shrink-0" />
            <span className="">{exam.name}</span>
          </h2>
          {exam.description && (
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{exam.description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <StatusBadge isCompleted={isCompleted} isPasswordProtected={exam.isPasswordProtected} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
        <StatMetric 
          icon={<Clock className="h-3 w-3 sm:h-4 sm:w-4" />}
          value={exam.timeLimit}
          label="Minutes"
          variant="primary"
        />
        <StatMetric 
          icon={<HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />}
          value={questionCount}
          label="Questions"
          variant="default"
        />
        <StatMetric 
          icon={<Target className="h-3 w-3 sm:h-4 sm:w-4" />}
          value={exam.totalMarks}
          label="Total Marks"
          variant="success"
        />
        <StatMetric 
          icon={<Star className="h-3 w-3 sm:h-4 sm:w-4" />}
          value={sectionCount}
          label="Sections"
          variant="warning"
        />
      </div>

      {/* Password Protection Warning */}
      {exam.isPasswordProtected && !isCompleted && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 rounded-xl px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-amber-800">Password Protected</p>
              <p className="text-xs text-amber-700 mt-1 sm:mt-0">You&apos;ll need the exam password to proceed</p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {submission && isCompleted && (
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <ScoreVisualization 
            percentage={scorePercentage}
            score={submission.earnedMarks}
            totalMarks={exam.totalMarks}
          />
          
          {/* Completion Date */}
          {submission.completedAt && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 rounded-xl border border-slate-200/60 shadow-sm gap-2 sm:gap-0">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium">Completed on</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                {formatDate(submission.completedAt)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {isCompleted ? (
        <Button 
          variant="outline" 
          className="w-full cursor-pointer bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-blue-200/60 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg py-4 sm:py-6 rounded-xl font-semibold text-sm sm:text-base"
          onClick={handleViewResults}
          aria-label={`View detailed results for ${exam.name}`}
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          <span className="hidden sm:inline">View Detailed Results</span>
          <span className="sm:hidden">View Results</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
        </Button>
      ) : (
        <Button
          className="w-full cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 sm:py-6 rounded-xl transition-all duration-300 hover:shadow-xl shadow-lg text-sm sm:text-base"
          onClick={handleOpenStartDialog}
          aria-label={`Start exam: ${exam.name}`}
        >
          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Start Exam
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
        </Button>
      )}

      {/* Start Exam Dialog */}
      <StartExamDialog
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onStartExam={handleStartExam}
        exam={exam}
      />
    </Card>
  );
});

ExamCard.displayName = "ExamCard";
export default ExamCard;
