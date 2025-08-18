import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Exam, Submission, Question } from '@/constants/types';
import { Exam, ExamSubmissionData, QuestionAnalysis } from '../types/index';
import QuestionResultItem from './QuestionResultItem';

interface QuestionResultsListProps {
  exam: Exam;
  submission: ExamSubmissionData;
}

const QuestionResultsList: React.FC<QuestionResultsListProps> = ({
  exam,
  submission,
}) => {
  // Safety check - don't render if essential data is missing
  if (!exam || !submission || !submission.questionAnalysis || !Array.isArray(submission.questionAnalysis) || submission.questionAnalysis.length === 0) {
    console.warn('QuestionResultsList: Invalid props', { exam: !!exam, submission: !!submission, answers: !!submission?.questionAnalysis, answersType: Array.isArray(submission?.questionAnalysis) ? 'array' : typeof submission?.questionAnalysis });
    return (
      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Results</CardTitle>
          <CardDescription>
            Unable to load question results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question-by-Question Results</CardTitle>
        <CardDescription>
          Review your answers for each question
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(submission.questionAnalysis || []).map((question: QuestionAnalysis, index: number) => {
            // Handle unanswered questions based on your data representation
            const userAnswer = question.status === "NOT_ANSWERED" || question.userAnswer === -1
              ? undefined
              : question.userAnswer;

            const isCorrect = userAnswer !== undefined && userAnswer === question.correctOption;

            return (
              <QuestionResultItem
                key={question.questionId || index} // Use questionId if available
                question={question}
                index={index}
                userAnswer={userAnswer}
                isCorrect={isCorrect}
                showExplanation={true}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionResultsList;
