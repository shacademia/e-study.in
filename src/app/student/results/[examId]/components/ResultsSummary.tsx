import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Sparkles  } from 'lucide-react';
// import { Exam, Submission } from '@/constants/types';
import { Exam, ExamSubmissionData, Statistics } from '../types/index';

interface ResultsSummaryProps {
  exam: Exam;
  submission: ExamSubmissionData;
  correctAnswers: number | null;
  totalQuestions: number;
  percentage: number;
  grade: string;
  statistics: Statistics;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  exam,
  submission,
  correctAnswers,
  totalQuestions,
  percentage,
  grade,
  statistics
}) => {
  const incorrectAnswers = totalQuestions - (correctAnswers ?? 0) - (statistics.unanswered ?? 0);
  const unanswered = statistics.unanswered !== undefined
    ? statistics.unanswered
    : totalQuestions - (correctAnswers ?? 0) - incorrectAnswers;

  const getMessage = () => {
    if (percentage >= 95)
      return {
        text: "Outstanding! You mastered this exam. Truly exceptional work.",
        color: "text-green-800 bg-green-50 border-green-200"
      };
    if (percentage >= 90)
      return {
        text: "Excellent performance. Keep up the great work!",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    if (percentage >= 85)
      return {
        text: "Very strong result. You're on the path to mastery.",
        color: "text-teal-700 bg-teal-50 border-teal-200"
      };
    if (percentage >= 80)
      return {
        text: "Great result! Review minor mistakes for perfection.",
        color: "text-blue-700 bg-blue-50 border-blue-200"
      };
    if (percentage >= 75)
      return {
        text: "Good work! Reinforce what you missed for an even better score.",
        color: "text-sky-800 bg-sky-50 border-sky-200"
      };
    if (percentage >= 70)
      return {
        text: "Nice effort. Keep practicing to reach the next level.",
        color: "text-indigo-700 bg-indigo-50 border-indigo-200"
      };
    if (percentage >= 65)
      return {
        text: "Solid foundation, but there is room to improve. Review mistakes.",
        color: "text-violet-700 bg-violet-50 border-violet-200"
      };
    if (percentage >= 60)
      return {
        text: "Decent work, but more practice will boost your score.",
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    if (percentage >= 50)
      return {
        text: "Fair attempt. Make sure to review the concepts you missed.",
        color: "text-orange-700 bg-orange-50 border-orange-200"
      };
    if (percentage >= 40)
      return {
        text: "Needs improvement. Focus on understanding key topics.",
        color: "text-rose-700 bg-rose-50 border-rose-200"
      };
    if (percentage >= 30)
      return {
        text: "Struggling. Go back to the basics and seek help if needed.",
        color: "text-red-700 bg-red-50 border-red-200"
      };
    return {
      text: "Don't give up! Review materials and try again you can do it.",
      color: "text-gray-700 bg-yellow-100/70 border-gray-200"
    };
  };

  const message = getMessage();

  return (
    <Card className="max-w-7xl mx-auto border border-gray-200 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {exam.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-gray-600 mt-1">
          <Calendar className="h-4 w-4" />
          Completed on{' '}
          {submission.completedAt
            ? new Date(submission.completedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'N/A'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Stat blocks */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Score</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.earnedMarks}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Correct</div>
            <div className="text-2xl font-bold text-emerald-600">{correctAnswers?? 0}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Incorrect</div>
            <div className="text-2xl font-bold text-rose-600">{incorrectAnswers}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Unanswered</div>
            <div className="text-2xl font-bold text-amber-500">{unanswered}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Grade</div>
            <div className="text-2xl font-bold text-amber-500">{grade}</div>
          </div>
        </div>

        {/* Percentage/Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Percentage</span>
            <Badge
              className="ml-2 text-amber-600"
              style={{
                background:
                  percentage >= 90
                    ? '#d1fae5'
                    : percentage >= 75
                      ? '#fef9c3'
                      : percentage >= 60
                        ? '#fee2e2'
                        : '#f3f4f6',
              }}
            >
              {Math.round(percentage)}%
            </Badge>
          </div>
          <div className="relative w-full h-5 mb-2">
            {/* Animated Gradient Progress Bar */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-200/50 via-green-200/50 to-amber-200/50" />
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(to right, ${percentage >= 90
                    ? "#34d399,#059669"
                    : percentage >= 75
                      ? "#4f46e5,#fde68a"
                      : percentage >= 60
                        ? "#f59e42,#fde68a"
                        : "#fca5a5,#fcd34d"
                  })`,
                boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
                transitionProperty: "width,background-color"
              }}
            />
            {/* Moving Icon */}
            <div
              className="absolute -top-2 z-10 transition-all duration-700"
              style={{
                left: `calc(${percentage}% - 16px)`, // Adjust so the icon stays inside
              }}
            >
              {/* You can use any icon or emoji! */}
              {percentage >= 90 ? (
                <Trophy className="h-6 w-6 text-emerald-500 drop-shadow-lg animate-bounce" />
              ) : percentage >= 60 ? (
                <Sparkles className="h-6 w-6 text-blue-500 drop-shadow-lg animate-pulse" />
              ) : (
                <span className="text-2xl select-none">{percentage >= 50 ? "🔥" : "💡"}</span>
              )}
            </div>
            {/* Border and fill outline */}
            <div className="absolute inset-0 border rounded-full pointer-events-none" style={{ borderColor: "#d1d5db" }} />
          </div>
        </div>

        {/* Feedback message */}
        <div className="mt-3">
          <div
            className={`px-4 py-3 text-center rounded-md border text-sm font-medium transition-colors duration-200 ${message.color}`}
          >
            {message.text}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsSummary;
