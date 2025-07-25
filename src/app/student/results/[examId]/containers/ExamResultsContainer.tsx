import React from 'react';
import { useExamResults } from '../hooks/useExamResults';
import { useResultsData } from '../hooks/useResultsData';
import { Exam, Submission } from '@/constants/types';

interface ExamResultsContainerProps {
  examId: string;
  children: (props: {
    exam: Exam | null;
    submission: Submission | null;
    loading: boolean;
    error: string | null;
    dataStatus: 'loading' | 'error' | 'empty' | 'ready';
  }) => React.ReactNode;
}

const ExamResultsContainer: React.FC<ExamResultsContainerProps> = ({ 
  examId, 
  children 
}) => {
  const { exam, submission, loading, error } = useExamResults(examId);
  const { dataStatus } = useResultsData(exam, submission, loading, error);

  return (
    <>
      {children({
        exam,
        submission,
        loading,
        error,
        dataStatus,
      })}
    </>
  );
};

export default ExamResultsContainer;
