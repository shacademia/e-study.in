import { useMemo } from 'react';
import { Exam, Submission } from '@/constants/types';
import { calculateResults } from '../utils/resultsUtils';

interface UseResultsCalculationReturn {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  isLoading: boolean;
}

export const useResultsCalculation = (
  exam: Exam | null,
  submission: Submission | null
): UseResultsCalculationReturn => {
  const results = useMemo(() => {
    // Return early with safe defaults if data is not available
    if (!exam || !submission) {
      return {
        correctAnswers: 0,
        totalQuestions: 0,
        percentage: 0,
        grade: 'N/A',
        isLoading: true,
      };
    }

    try {
      return {
        ...calculateResults(exam, submission),
        isLoading: false,
      };
    } catch (error) {
      console.error('Error calculating results:', error);
      return {
        correctAnswers: 0,
        totalQuestions: 0,
        percentage: 0,
        grade: 'Error',
        isLoading: false,
      };
    }
  }, [exam, submission]);

  return results;
};
