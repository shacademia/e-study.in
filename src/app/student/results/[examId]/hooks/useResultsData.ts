import { useMemo } from 'react';
import { Exam, Submission } from '@/constants/types';

interface UseResultsDataReturn {
  hasValidData: boolean;
  isEmpty: boolean;
  hasExam: boolean;
  hasSubmission: boolean;
  dataStatus: 'loading' | 'error' | 'empty' | 'ready';
}

export const useResultsData = (
  exam: Exam | null,
  submission: Submission | null,
  loading: boolean,
  error: string | null
): UseResultsDataReturn => {
  const dataAnalysis = useMemo(() => {
    if (loading) {
      return {
        hasValidData: false,
        isEmpty: false,
        hasExam: false,
        hasSubmission: false,
        dataStatus: 'loading' as const,
      };
    }

    if (error) {
      return {
        hasValidData: false,
        isEmpty: false,
        hasExam: false,
        hasSubmission: false,
        dataStatus: 'error' as const,
      };
    }

    const hasExam = !!exam;
    const hasSubmission = !!submission;
    const hasValidData = hasExam && hasSubmission;
    const isEmpty = !hasExam && !hasSubmission;

    return {
      hasValidData,
      isEmpty,
      hasExam,
      hasSubmission,
      dataStatus: hasValidData ? 'ready' as const : 'empty' as const,
    };
  }, [exam, submission, loading, error]);

  return dataAnalysis;
};
