import React, { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Lock, HelpCircle, Star, BarChart3, CheckCircle2, 
  Calendar, Sparkles, BookOpen, Target, ChevronRight,
  Clock
} from "lucide-react";

// ==============================================
// TYPE DEFINITIONS & UTILITY FUNCTIONS SECTION
// ==============================================

// Define the missing props interface
export interface ExamCardProps {
  exam: {
    id: string;
    name: string;
    description?: string;
    timeLimit: number;
    totalMarks: number;
    questionsCount?: number;
    questions?: any[];
    sections?: any[];
    isPasswordProtected: boolean;
  };
  submission?: {
    id: string;
    score: number;
    completedAt: string | Date;
  };
  isCompleted: boolean;
  onStartExam: (id: string) => void;
  onViewResults: (id: string) => void;
}

// Utility function to calculate percentage score
export const calculateScorePercentage = (score: number, totalMarks: number): number => {
  if (totalMarks === 0) return 0;
  return (score / totalMarks) * 100;
};

// Utility function to format date for display
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ==============================================
// SUB-COMPONENT 1: STAT METRIC CARDS
// ==============================================
const StatMetric = memo(({
  icon, value, label, variant = "default"
}: {
  icon: React.ReactNode; value: string | number; label: string;
  variant?: "default" | "primary" | "success" | "warning";
}) => {
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
const ScoreVisualization = memo(({ percentage, score, totalMarks }: { 
  percentage: number; score: number; totalMarks: number; 
}) => {
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
const StatusBadge = memo(({ isCompleted, isPasswordProtected }: { 
  isCompleted: boolean; isPasswordProtected: boolean; 
}) => {
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
  // COMPUTED VALUES
  const scorePercentage = useMemo(() => 
    submission ? calculateScorePercentage(submission.score, exam.totalMarks) : 0,
    [submission, exam.totalMarks]
  );
  
  const sectionCount = exam.sections?.length || 1;
  const questionCount = exam.questions?.length || exam.questionsCount || 0;

  // EVENT HANDLERS
  const handleStartExam = useCallback(() => onStartExam(exam.id), [onStartExam, exam.id]);
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
            score={submission.score}
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
          className="w-full bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-blue-200/60 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg py-6 rounded-xl font-semibold"
          onClick={handleViewResults}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Detailed Results
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg"
          onClick={handleStartExam}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Exam
          <Sparkles className="h-4 w-4 ml-2" />
        </Button>
      )}
    </Card>
  );
});

ExamCard.displayName = "ExamCard";
export default ExamCard;
