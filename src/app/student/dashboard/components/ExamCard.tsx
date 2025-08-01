import React, { memo, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Lock, HelpCircle, Star, BarChart3, Trophy, CheckCircle2, 
  Calendar, Sparkles, Timer, BookOpen, Target, TrendingUp, Award, ChevronRight
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
// This creates the small metric cards (Time, Questions, Marks, Sections)
const StatMetric = memo(({
  icon, value, label, trend, variant = "default"
}: {
  icon: React.ReactNode; value: string | number; label: string;
  trend?: "up" | "down" | "neutral"; variant?: "default" | "primary" | "success" | "warning";
}) => {
  // Color schemes for different metric types
  const variantClasses = {
    default: "bg-slate-50 border-slate-200 text-slate-700",      // Gray theme
    primary: "bg-blue-50 border-blue-200 text-blue-700",        // Blue theme  
    success: "bg-emerald-50 border-emerald-200 text-emerald-700", // Green theme
    warning: "bg-amber-50 border-amber-200 text-amber-700"       // Orange theme
  };

  return (
    // STAT METRIC CONTAINER - Individual metric card wrapper
    <div 
      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors duration-200 ${variantClasses[variant]}`}
      role="img"
      aria-label={`${label}: ${value}`}
    >
      {/* STAT ICON CONTAINER - White background circle for icon */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-white">
        {icon}
      </div>
      
      {/* STAT TEXT CONTENT - Value and label */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Large number/value display */}
          <span className="font-bold text-lg tabular-nums leading-none">{value}</span>
          
          {/* Optional trend indicator (up/down arrow) */}
          {trend && (
            <TrendingUp 
              className={`h-3 w-3 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}
              aria-hidden="true"
            />
          )}
        </div>
        {/* Small descriptive label below the value */}
        <p className="text-xs font-medium text-slate-600 truncate mt-1">{label}</p>
      </div>
    </div>
  );
});
StatMetric.displayName = "StatMetric";


// ==============================================
// SUB-COMPONENT 2: SCORE VISUALIZATION
// ==============================================

// This creates the score display with circular progress and grade info (only shown for completed exams)
const ScoreVisualization = memo(({ percentage, score, totalMarks }: { 
  percentage: number; score: number; totalMarks: number; 
}) => {
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate grade based on percentage with matching background colors
  const { grade, gradeColor, gradeDescription, backgroundColor, borderColor, progressClass } = useMemo(() => {
    if (normalizedPercentage >= 90) return { 
      grade: "A+", 
      gradeColor: "#059669", 
      gradeDescription: "Excellent",
      backgroundColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-600"
    };
    if (normalizedPercentage >= 80) return { 
      grade: "A", 
      gradeColor: "#10b981", 
      gradeDescription: "Very Good",
      backgroundColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
    };
    if (normalizedPercentage >= 70) return { 
      grade: "B+", 
      gradeColor: "#3b82f6", 
      gradeDescription: "Good",
      backgroundColor: "bg-blue-50",
      borderColor: "border-blue-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600"
    };
    if (normalizedPercentage >= 60) return { 
      grade: "B", 
      gradeColor: "#f59e0b", 
      gradeDescription: "Fair",
      backgroundColor: "bg-amber-50",
      borderColor: "border-amber-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500"
    };
    if (normalizedPercentage >= 50) return { 
      grade: "C", 
      gradeColor: "#ef4444", 
      gradeDescription: "Needs Improvement",
      backgroundColor: "bg-red-50",
      borderColor: "border-red-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-red-400 [&>div]:to-red-600"
    };
    return { 
      grade: "F", 
      gradeColor: "#dc2626", 
      gradeDescription: "Failed",
      backgroundColor: "bg-red-50",
      borderColor: "border-red-200",
      progressClass: "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-700"
    };
  }, [normalizedPercentage]);

  return (
    // SCORE VISUALIZATION CONTAINER - Main wrapper with dynamic grade-matching background
    <div 
      className={`flex items-center gap-4 p-5 ${backgroundColor} rounded-2xl border ${borderColor} transition-all duration-300`}
      role="img"
      aria-label={`Score: ${score} out of ${totalMarks} marks, ${normalizedPercentage}% - Grade ${grade} (${gradeDescription})`}
    >
      {/* CIRCULAR PROGRESS SECTION - Left side with percentage circle */}
      <div className="relative">
        {/* Circular progress background */}
        <div className="w-20 h-20 rounded-full bg-white shadow-inner p-1">
          <Progress 
            value={normalizedPercentage} 
            className={`w-full h-full [&>div]:rounded-full ${progressClass}`}
          />
        </div>
        
        {/* Percentage and grade text overlay on circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none" style={{ color: gradeColor }}>
            {Math.round(normalizedPercentage)}%
          </span>
          <span className="text-xs font-semibold" style={{ color: gradeColor }}>
            {grade}
          </span>
        </div>
      </div>
      
      {/* SCORE DETAILS SECTION - Right side with score info */}
      <div className="flex-1">
        {/* Score fraction with trophy icon */}
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-5 w-5" style={{ color: gradeColor }} />
          <span className="text-xl font-bold" style={{ color: gradeColor }}>
            {score}/{totalMarks}
          </span>
        </div>
        
        {/* Grade description text */}
        <p className="text-sm font-medium" style={{ color: gradeColor }}>
          {gradeDescription}
        </p>
        
        {/* Small progress bar at bottom - Using inline styles for guaranteed visibility */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${normalizedPercentage}%`,
                background: `linear-gradient(to right, ${gradeColor}aa, ${gradeColor})`
              }}
            />
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

// This creates the "Completed" or "Available" badge in the top-right corner
const StatusBadge = memo(({ isCompleted, isPasswordProtected }: { 
  isCompleted: boolean; isPasswordProtected: boolean; 
}) => {
  // COMPLETED STATE BADGE - Green gradient with checkmark
  if (isCompleted) {
    return (
      <Badge 
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg"
        role="status"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span className="ml-2 font-semibold">Completed</span>
      </Badge>
    );
  }

  // AVAILABLE STATE BADGE - Blue gradient with sparkles (and optional lock icon)
  return (
    <Badge 
      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg"
      role="status"
    >
      <Sparkles className="h-4 w-4" />
      <span className="ml-2 font-semibold">Available</span>
      {/* Show lock icon if password protected */}
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
  // COMPUTED VALUES - Calculate derived data
  const scorePercentage = useMemo(() => 
    submission ? calculateScorePercentage(submission.score, exam.totalMarks) : 0,
    [submission, exam.totalMarks]
  );
  
  const sectionCount = exam.sections?.length || 1;
  const questionCount = exam.questions?.length || exam.questionsCount || 0;

  // EVENT HANDLERS - Memoized click handlers
  const handleStartExam = useCallback(() => onStartExam(exam.id), [onStartExam, exam.id]);
  const handleViewResults = useCallback(() => (submission ? onViewResults(submission.id) : null), [onViewResults, submission]);

  // CARD STYLING - Determine card appearance based on state
  const cardVariant = isCompleted ? "completed" : exam.isPasswordProtected ? "secured" : "available";

  // Top accent bar colors for different states
  const accentColors = {
    completed: "bg-gradient-to-r from-emerald-500 to-green-500",  // Green for completed
    secured: "bg-gradient-to-r from-amber-500 to-orange-500",     // Orange for password protected
    available: "bg-gradient-to-r from-blue-500 to-indigo-500"    // Blue for available
  };

  return (
    // MAIN CARD CONTAINER - The outermost wrapper
    <Card 
      className={`relative overflow-hidden border-2 transition-shadow duration-200 hover:shadow-lg}`}
      role="article"
      aria-labelledby={`exam-title-${exam.id}`}
      aria-describedby={`exam-description-${exam.id}`}
    >
      {/* L-SHAPED CORNER ACCENT BAR - Horizontal and vertical stripes */}
      {/* Horizontal bar (x-axis) */}
      <div className={`absolute top-0 left-0 w-22 h-2 ${accentColors[cardVariant]} shadow-sm rounded-4xl`} />

      {/* Vertical bar (y-axis) */}
      {/* <div className={`absolute top-0 left-0 w-1 h-full ${accentColors[cardVariant]} shadow-sm`} /> */}

      {/* CARD HEADER SECTION - Title, description, and status badge */}
      <CardHeader className="pb-3 pt-6 relative z-10">
        <div className="flex justify-between items-start gap-4">
          {/* LEFT SIDE - Exam title and description */}
          <div className="flex-1 min-w-0">
            {/* EXAM TITLE - Main heading with book icon */}
            <CardTitle 
              id={`exam-title-${exam.id}`}
              className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 transition-colors duration-200"
            >
              <BookOpen className="inline-block h-5 w-5 mr-2 text-slate-600" />
              {exam.name}
            </CardTitle>
            
            {/* EXAM DESCRIPTION - Optional subtitle */}
            {exam.description && (
              <CardDescription 
                id={`exam-description-${exam.id}`}
                className="text-slate-600 line-clamp-2 leading-relaxed"
              >
                {exam.description}
              </CardDescription>
            )}
          </div>
          
          {/* RIGHT SIDE - Status badge (Completed/Available) */}
          <StatusBadge isCompleted={isCompleted} isPasswordProtected={exam.isPasswordProtected} />
        </div>
      </CardHeader>

      {/* CARD CONTENT SECTION - Main body with stats, warnings, scores, and buttons */}
      <CardContent className="space-y-6 relative z-10">
        
        {/* STATISTICS GRID - 4 metric cards in a responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Time limit metric */}
          <StatMetric 
            icon={<Timer className="h-5 w-5 text-blue-600" />}
            value={exam.timeLimit}
            label="Minutes"
            variant="primary"
          />
          
          {/* Questions count metric */}
          <StatMetric 
            icon={<HelpCircle className="h-5 w-5 text-purple-600" />}
            value={questionCount}
            label={questionCount === 1 ? "Question" : "Questions"}
            variant="default"
          />
          
          {/* Total marks metric */}
          <StatMetric 
            icon={<Target className="h-5 w-5 text-emerald-600" />}
            value={exam.totalMarks}
            label="Total Marks"
            variant="success"
          />
          
          {/* Sections count metric */}
          <StatMetric 
            icon={<Star className="h-5 w-5 text-indigo-600" />}
            value={sectionCount}
            label={sectionCount > 1 ? "Sections" : "Section"}
            variant="default"
          />
        </div>

        {/* PASSWORD PROTECTION WARNING - Only shown for password-protected, uncompleted exams */}
        {exam.isPasswordProtected && !isCompleted && (
          <div 
            className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3"
            role="alert"
          >
            {/* Warning icon */}
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              {/* Warning title */}
              <p className="text-sm font-semibold text-amber-900">Password Protected</p>
              {/* Warning description */}
              <p className="text-xs text-amber-700">You&apos;ll need the exam password to proceed</p>
            </div>
          </div>
        )}

        {/* COMPLETION SUMMARY - Only shown for completed exams */}
        {submission && isCompleted && (
          <div className="space-y-4">
            {/* SCORE VISUALIZATION - Circular progress with grade */}
            <ScoreVisualization 
              percentage={scorePercentage}
              score={submission.score}
              totalMarks={exam.totalMarks}
            />
            
            {/* COMPLETION DATE INFO - When the exam was completed */}
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Completed on {submission.completedAt ? formatDate(submission.completedAt) : "N/A"}</span>
              </div>
              {/* Trophy icon for achievement */}
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        )}

        {/* ACTION BUTTON SECTION - Different buttons based on completion status */}
        <div className="pt-2">
          {isCompleted ? (
            // VIEW RESULTS BUTTON - For completed exams
            <Button
              variant="outline"
              size="lg"
              className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold py-6 rounded-xl transition-colors duration-200"
              onClick={handleViewResults}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              View Detailed Results
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            // START EXAM BUTTON - For available exams
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl transition-colors duration-200"
              onClick={handleStartExam}
            >
              <Play className="h-5 w-5 mr-3" />
              Start Exam
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ExamCard.displayName = "ExamCard";
export default ExamCard;
