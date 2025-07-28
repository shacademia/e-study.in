import { useState, useEffect, useCallback } from 'react';
import { examService } from '@/services';
import { Exam, Pagination, ExamFilters } from '@/constants/types';

interface UseExamListReturn {
  exams: Exam[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: ExamFilters;
  setFilters: (filters: ExamFilters) => void;
  refetch: () => Promise<void>;
}

export const useExamList = (initialFilters: ExamFilters = {}): UseExamListReturn => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<ExamFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const fetchExams = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await examService.getAllExams(filters);
      
      if (response.data) {
        setExams(response.data.exams || []);
        setPagination(response.data.pagination || null);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams');
      setExams([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const updateFilters = useCallback((newFilters: ExamFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when filters change (except when explicitly setting page)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  return {
    exams,
    loading,
    error,
    pagination,
    filters,
    setFilters: updateFilters,
    refetch: fetchExams,
  };
};
