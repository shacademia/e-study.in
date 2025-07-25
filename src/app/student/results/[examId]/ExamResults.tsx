'use client';

import React from 'react';
import { useExamResults } from './hooks/useExamResults';
import { useResultsCalculation } from './hooks/useResultsCalculation';
import ResultsHeader from './components/ResultsHeader';
import ResultsLoading from './components/ResultsLoading';
import ResultsNotFound from './components/ResultsNotFound';
import ResultsSummary from './components/ResultsSummary';
import QuestionResultsList from './components/QuestionResultsList';
import ResultsActions from './components/ResultsActions';

interface ExamResultsProps {
  examId: string;
}

const ExamResults: React.FC<ExamResultsProps> = ({ examId }) => {
  const { exam, submission, loading, error } = useExamResults(examId);
  
  // Only calculate results when we have valid data
  const { correctAnswers, totalQuestions, percentage, grade } = useResultsCalculation(
    loading ? null : exam, 
    loading ? null : submission
  );

  if (loading) {
    return <ResultsLoading />;
  }

  if (error || !exam || !submission) {
    return <ResultsNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResultsHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <ResultsSummary
            exam={exam}
            submission={submission}
            correctAnswers={correctAnswers}
            totalQuestions={totalQuestions}
            percentage={percentage}
            grade={grade}
          />

          <QuestionResultsList exam={exam} submission={submission} />

          <ResultsActions />
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
