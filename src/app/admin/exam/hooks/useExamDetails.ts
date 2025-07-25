import { useState, useEffect, useCallback } from 'react';
import { examService } from '@/services';
import { Exam } from '@/constants/types';

interface UseExamDetailsReturn {
  exam: Exam | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExamDetails = (examId: string): UseExamDetailsReturn => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExam = useCallback(async () => {
    if (!examId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const examData = await examService.getExamById(examId);
      setExam(examData);
    } catch (err) {
      console.error('Error fetching exam details:', err);
      setError('Failed to load exam details');
      setExam(null);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  return {
    exam,
    loading,
    error,
    refetch: fetchExam,
  };
};
