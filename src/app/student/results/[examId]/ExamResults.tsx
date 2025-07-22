'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowLeft, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '@hooks/useMockAuth';
import { useExams, useSubmissions } from '@/hooks/useApiServices';
import { Exam, Submission, Question } from '@/constants/types';

interface ExamResultsProps {
  examId: string;
}

const ExamResults: React.FC<ExamResultsProps> = ({ examId }) => {
  const router = useRouter();
  const { user } = useAuth();

  const { getExamById } = useExams();
  const { getUserSubmissions } = useSubmissions();

  const [exam, setExam] = useState<Exam | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!examId || !user) return;

      try {
        const [examData, allSubmissions] = await Promise.all([
          getExamById(examId),
          getUserSubmissions(user.id),
        ]);

        if (examData) {
          setExam(examData as Exam);

          // 👇 Fix: assuming getUserSubmissions returns an array
          const userSubmission = (allSubmissions as Submission[]).find(
            (sub: Submission) => sub.examId === examId
          );

          setSubmission(userSubmission ?? null);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, user, getExamById, getUserSubmissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!exam || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Results not found
      </div>
    );
  }

  const correctAnswers = (exam.questions || []).filter(
    (q: Question) => submission.answers[q.id] === q.correctOption
  ).length;

  const totalQuestions = exam.questions ? exam.questions.length : 0;
  const percentage = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const grade =
    percentage >= 98
      ? 'AA'
      : percentage >= 90
      ? 'A+'
      : percentage >= 80
      ? 'A'
      : percentage >= 70
      ? 'B'
      : percentage >= 60
      ? 'C'
      : 'F';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student/dashboard')}
                className="mr-4 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900 flex justify-center">
                Exam Results
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Results Summary */}
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

          {/* Question-by-Question */}
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Results</CardTitle>
              <CardDescription>
                Review your answers for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(exam.questions || []).map((question: Question, index: number) => {
                  const userAnswer = submission.answers[question.id];
                  const isCorrect = userAnswer === question.correctOption;

                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 mr-2">
                            Question {index + 1}
                          </span>
                          <Badge variant={isCorrect ? 'default' : 'destructive'}>
                            {isCorrect ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                      </div>

                      <p className="font-medium mb-3">{question.content}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option: string, optionIndex: number) => {
                          const isOptionCorrect = optionIndex === question.correctOption;
                          const isUserIncorrect =
                            userAnswer === optionIndex && !isCorrect;

                          const optionStyle = isOptionCorrect
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : isUserIncorrect
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-gray-50 border-gray-200';

                          return (
                            <div
                              key={optionIndex}
                              className={`p-2 rounded border text-sm ${optionStyle}`}
                            >
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span>{option}</span>
                                {isOptionCorrect && (
                                  <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                )}
                                {isUserIncorrect && (
                                  <XCircle className="h-4 w-4 ml-auto text-red-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {userAnswer === undefined && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          No answer provided
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.push('/student/dashboard')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => router.push('/rankings')}
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Rankings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Helper Component
const SummaryItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default ExamResults;
