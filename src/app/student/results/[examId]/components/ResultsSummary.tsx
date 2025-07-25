import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { Exam, Submission } from '@/constants/types';
import SummaryItem from './SummaryItem';

interface ResultsSummaryProps {
  exam: Exam;
  submission: Submission;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  exam,
  submission,
  correctAnswers,
  totalQuestions,
  percentage,
  grade,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          {exam.name} - Results
        </CardTitle>
        <CardDescription>
          Completed on{' '}
          {submission.completedAt ? new Date(submission.completedAt).toLocaleDateString() : "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryItem label="Total Score" value={submission.score} color="blue" />
          <SummaryItem label="Correct Answers" value={correctAnswers} color="green" />
          <SummaryItem label="Percentage" value={`${percentage}%`} color="purple" />
          <SummaryItem label="Grade" value={grade} color="orange" />
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Performance</span>
            <span>
              {correctAnswers}/{totalQuestions} correct
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsSummary;
