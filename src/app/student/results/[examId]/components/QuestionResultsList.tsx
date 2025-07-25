import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Exam, Submission, Question } from '@/constants/types';
import QuestionResultItem from './QuestionResultItem';

interface QuestionResultsListProps {
  exam: Exam;
  submission: Submission;
}

const QuestionResultsList: React.FC<QuestionResultsListProps> = ({
  exam,
  submission,
}) => {
  // Safety check - don't render if essential data is missing
  if (!exam || !submission || !submission.answers) {
    console.warn('QuestionResultsList: Invalid props', { exam: !!exam, submission: !!submission, answers: !!submission?.answers });
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

  // Debug: Check exam questions structure
  console.log('QuestionResultsList: Exam questions structure:', {
    hasQuestions: !!exam.questions,
    questionsLength: exam.questions?.length || 0,
    firstQuestion: exam.questions?.[0],
    questionsType: Array.isArray(exam.questions) ? 'array' : typeof exam.questions,
  });

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
          {(exam.questions || []).map((question: Question, index: number) => {
            // Safety check for submission answers
            const userAnswer = submission.answers?.[question.id];
            const isCorrect = userAnswer !== undefined && userAnswer === question.correctOption;

            return (
              <QuestionResultItem
                key={question.id}
                question={question}
                index={index}
                userAnswer={userAnswer}
                isCorrect={isCorrect}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionResultsList;
