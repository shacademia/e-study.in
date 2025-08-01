import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';
// import { Exam, Submission } from '@/constants/types';
import { Exam, ExamSubmissionData, Statistics } from '../types/index';

interface ResultsSummaryProps {
  exam: Exam;
  submission: ExamSubmissionData;
  correctAnswers: number;
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
  const incorrectAnswers = totalQuestions - correctAnswers;

  // Message and color mapping
  const getMessage = () => {
    if (percentage >= 90)
      return {
        text: "Excellent performance. Keep up the great work!",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    if (percentage >= 75)
      return {
        text: "Good result! Review mistakes for mastery.",
        color: "text-blue-700 bg-blue-50 border-blue-200"
      };
    if (percentage >= 60)
      return {
        text: "Decent effort, but more practice will boost your score.",
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    return {
      text: "You can improve! Review concepts and try again.",
      color: "text-rose-700 bg-rose-50 border-rose-200"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Score</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.earnedMarks}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Correct</div>
            <div className="text-2xl font-bold text-emerald-600">{correctAnswers}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Incorrect</div>
            <div className="text-2xl font-bold text-rose-600">{incorrectAnswers}</div>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <div className="text-xs text-gray-500 mb-1">Grade</div>
            <div className="text-2xl font-bold text-amber-500">{grade}</div>
          </div>
        </div>

        {/* Percentage/Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Percentage</span>
            <Badge
              className="ml-2 text-black"
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
          <Progress value={percentage} className="h-3 rounded-full bg-gray-200" />
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
