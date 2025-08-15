import React, { memo, useMemo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Play, Lock, HelpCircle, Star, BarChart3, CheckCircle2, 
  Calendar, Sparkles, BookOpen, Target, ChevronRight,
  Clock, X, FileText, AlertTriangle, User, Shield, Eye
} from "lucide-react";


// Import all necessary types from your centralized type definitions
import type {
  ExamCardProps,
  StatMetricProps,
  ScoreVisualizationProps,
  StatusBadgeProps
} from "../types";


// ==============================================
// UTILITY FUNCTIONS SECTION
// ==============================================


// Utility function to calculate percentage score
// export const calculateScorePercentage = (score: number, totalMarks: number): number => {
//   if (totalMarks === 0) return 0;
//   return (score / totalMarks) * 100;
// };


// Utility function to format date for display
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


// ==============================================
// SUB-COMPONENT: START EXAM DIALOG
// ==============================================
interface StartExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: () => void;
  exam: {
    name: string;
    instructions?: string;
    timeLimit: number;
    totalMarks: number;
    questionsCount?: number;
    isPasswordProtected?: boolean;
  };
}

const StartExamDialog: React.FC<StartExamDialogProps> = memo(({
  isOpen,
  onClose,
  onStartExam,
  exam
}) => {
  const systemInstructions = [
    "Ensure you have a stable internet connection throughout the exam",
    "Do not refresh or close the browser tab during the exam",
    "You cannot go back to previous questions once submitted",
    "The exam will auto-submit when time expires",
    "Switching tabs or minimizing the window may be monitored"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50/50 to-gray-50/30 border-slate-200/60 shadow-2xl">
        {/* Header */}
        <DialogHeader className="text-center pb-4 border-b border-slate-200/60">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
            Ready to Start?
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Please read the instructions carefully before beginning your exam
          </DialogDescription>
        </DialogHeader>

        {/* Exam Info */}
        <div className="py-6 space-y-6">
          {/* Exam Title & Stats */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {exam.name}
            </h3>
            
            <div className="flex justify-center gap-4 mb-6">
              <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="h-4 w-4 mr-1" />
                {exam.timeLimit} minutes
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                <Target className="h-4 w-4 mr-1" />
                {exam.totalMarks} marks
              </Badge>
              {exam.questionsCount && (
                <Badge variant="secondary" className="px-4 py-2 bg-purple-50 text-purple-700 border-purple-200">
                  <FileText className="h-4 w-4 mr-1" />
                  {exam.questionsCount} questions
                </Badge>
              )}
            </div>
          </div>

          {/* Instructor Instructions - Only show if instructions exist */}
          {exam.instructions && exam.instructions.trim() && (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Instructions from Instructor</h4>
              </div>
              <div className="text-sm text-blue-700 leading-relaxed whitespace-pre-wrap">
                {exam.instructions}
              </div>
            </div>
          )}

          {/* System Instructions */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-6 border border-amber-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-amber-800">System Guidelines</h4>
            </div>
            <ul className="space-y-3">
              {systemInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-amber-700">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Password Protection Notice - Only show if password protected */}
          {exam.isPasswordProtected && (
            <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 rounded-xl p-4 border border-red-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Password Required</p>
                  <p className="text-xs text-red-700">You&apos;ll be prompted for the exam password after clicking Start</p>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 rounded-xl p-4 border border-slate-300/60">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold mb-1">Important Notice:</p>
                <p>Once you start the exam, the timer begins immediately. Make sure you&apos;re ready and have adequate time to complete it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200/60">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 py-3 border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onStartExam}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:shadow-xl cursor-pointer"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Exam
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
StartExamDialog.displayName = "StartExamDialog";


// ==============================================
// SUB-COMPONENT 1: STAT METRIC CARDS
// ==============================================
const StatMetric = memo(({
  icon, value, label, variant = "default"
}: StatMetricProps) => {
  // Enhanced soothing gradient color schemes
  const variantClasses = {
    default: "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border-slate-200/60 shadow-sm hover:shadow-md",
    primary: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 border-blue-200/60 shadow-sm hover:shadow-md",        
    success: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 border-emerald-200/60 shadow-sm hover:shadow-md",
    warning: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 border-amber-200/60 shadow-sm hover:shadow-md"
  };


  const iconColors = {
    default: "text-slate-600",
    primary: "text-blue-600",
    success: "text-emerald-600", 
    warning: "text-amber-600"
  };


  const valueColors = {
    default: "text-slate-700",
    primary: "text-blue-700",
    success: "text-emerald-700",
    warning: "text-amber-700"
  };


  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${variantClasses[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-4 w-4 ${iconColors[variant]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className={`text-lg font-bold ${valueColors[variant]}`}>{value}</div>
      <div className="text-xs text-slate-400">
        {label === "Minutes" ? "Duration" : 
         label === "Questions" ? "Total" :
         label === "Total Marks" ? "Points" : "Parts"}
      </div>
    </div>
  );
});
StatMetric.displayName = "StatMetric";


// ==============================================
// SUB-COMPONENT 2: SCORE VISUALIZATION
// ==============================================
const ScoreVisualization = memo(({ percentage, score, totalMarks }: ScoreVisualizationProps) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate grade and styling with soothing gradients
  const { grade, gradeColor, gradeDescription, gradientBg, circleGradient } = useMemo(() => {
    if (normalizedPercentage >= 90) return { 
      grade: "A+", 
      gradeColor: "text-emerald-700", 
      gradeDescription: "Excellent", 
      isSuccess: true,
      gradientBg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100",
      circleGradient: "linear-gradient(135deg, #10b981, #059669)"
    };
    if (normalizedPercentage >= 80) return { 
      grade: "A", 
      gradeColor: "text-emerald-600", 
      gradeDescription: "Very Good", 
      isSuccess: true,
      gradientBg: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100",
      circleGradient: "linear-gradient(135deg, #34d399, #10b981)"
    };
    if (normalizedPercentage >= 70) return { 
      grade: "B+", 
      gradeColor: "text-blue-600", 
      gradeDescription: "Good", 
      isSuccess: true,
      gradientBg: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100",
      circleGradient: "linear-gradient(135deg, #3b82f6, #2563eb)"
    };
    if (normalizedPercentage >= 60) return { 
      grade: "B", 
      gradeColor: "text-purple-600", 
      gradeDescription: "Fair", 
      isSuccess: true,
      gradientBg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100",
      circleGradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
    };
    if (normalizedPercentage >= 50) return { 
      grade: "C", 
      gradeColor: "text-orange-600", 
      gradeDescription: "Needs Improvement", 
      isSuccess: false,
      gradientBg: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100",
      circleGradient: "linear-gradient(135deg, #f97316, #ea580c)"
    };
    return { 
      grade: "F", 
      gradeColor: "text-red-600", 
      gradeDescription: "Failed", 
      isSuccess: false,
      gradientBg: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-100",
      circleGradient: "linear-gradient(135deg, #ef4444, #dc2626)"
    };
  }, [normalizedPercentage]);


  return (
    <div className={`p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 ${gradientBg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Enhanced Circular Progress */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/90 flex items-center justify-center relative overflow-hidden shadow-lg">
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${circleGradient} ${normalizedPercentage * 3.6}deg, #e2e8f0 0deg)`
                }}
              />
              <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center z-10 shadow-inner">
                <div className="text-center">
                  <div className={`text-sm font-bold ${gradeColor}`}>{Math.round(normalizedPercentage)}%</div>
                  <div className={`text-xs font-medium ${gradeColor}`}>{grade}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Score Details */}
          <div>
            <div className={`text-xl font-bold ${gradeColor}`}>
              {score}/{totalMarks}
            </div>
            <div className={`text-sm font-medium ${gradeColor}`}>
              {gradeDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ScoreVisualization.displayName = "ScoreVisualization";


// ==============================================
// SUB-COMPONENT 3: STATUS BADGE
// ==============================================
const StatusBadge = memo(({ isCompleted, isPasswordProtected }: StatusBadgeProps) => {
  if (isCompleted) {
    return (
      <Badge className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Completed
      </Badge>
    );
  }


  return (
    <Badge className="px-4 py-2 bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
      <Sparkles className="h-4 w-4 mr-1" />
      Available
      {isPasswordProtected && <Lock className="h-3 w-3 ml-1" />}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";


// ==============================================
// MAIN COMPONENT: EXAM CARD
// ==============================================
const ExamCard: React.FC<ExamCardProps> = memo(({
  exam, submission, isCompleted, onStartExam, onViewResults
}) => {
  // State for dialog
  const [showStartDialog, setShowStartDialog] = useState(false);

  console.log("this is the instructions given by the instructor: ", exam.instructions);
  console.log("🙌😍❤️😁😍", submission)
  
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

  const handleViewResults = useCallback(() => (submission ? onViewResults(submission.id) : null), [onViewResults, submission]);


  return (
    <Card className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-white via-slate-50/50 to-gray-50/80 border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] relative overflow-hidden">
      {/* Subtle decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 via-transparent to-transparent rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100/30 via-transparent to-transparent rounded-full blur-2xl -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-500" />
            {exam.name}
          </h2>
          {exam.description && (
            <p className="text-sm text-slate-600">{exam.description}</p>
          )}
        </div>
        <StatusBadge isCompleted={isCompleted} isPasswordProtected={exam.isPasswordProtected} />
      </div>


      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatMetric 
          icon={<Clock className="h-4 w-4" />}
          value={exam.timeLimit}
          label="Minutes"
          variant="primary"
        />
        
        <StatMetric 
          icon={<HelpCircle className="h-4 w-4" />}
          value={questionCount}
          label="Questions"
          variant="default"
        />
        
        <StatMetric 
          icon={<Target className="h-4 w-4" />}
          value={exam.totalMarks}
          label="Total Marks"
          variant="success"
        />
        
        <StatMetric 
          icon={<Star className="h-4 w-4" />}
          value={sectionCount}
          label="Sections"
          variant="warning"
        />
      </div>


      {/* Password Protection Warning */}
      {exam.isPasswordProtected && !isCompleted && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 rounded-xl px-4 py-3 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Password Protected</p>
              <p className="text-xs text-amber-700">You&apos;ll need the exam password to proceed</p>
            </div>
          </div>
        </div>
      )}


      {/* Completion Summary */}
      {submission && isCompleted && (
        <div className="space-y-4 mb-6">
          <ScoreVisualization 
            percentage={scorePercentage}
            score={submission.earnedMarks}
            totalMarks={exam.totalMarks}
          />
          
          {/* Completion Date */}
          {submission.completedAt && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Completed on</span>
              </div>
              <div className="text-sm font-semibold text-slate-700">
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
          className="w-full cursor-pointer bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-blue-200/60 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg py-6 rounded-xl font-semibold"
          onClick={handleViewResults}
          aria-label={`View detailed results for ${exam.name}`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Results
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          className="w-full cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg"
          onClick={handleOpenStartDialog}
          aria-label={`Start exam: ${exam.name}`}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Exam
          <Sparkles className="h-4 w-4 ml-2" />
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
