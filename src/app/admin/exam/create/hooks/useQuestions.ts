import { useState, useCallback } from 'react';
import { Question } from '@/constants/types';
import { questionService } from '@/services/question';

interface UseQuestionsParams {
  page?: number;
  limit?: number;
  subject?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  search?: string;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async (params: UseQuestionsParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await questionService.getAllQuestions({
        page: params.page || 1,
        limit: params.limit || 50,
        subject: params.subject,
        difficulty: params.difficulty,
        search: params.search
      });

      let questionsData: Question[] = [];

      if (response?.data?.questions) {
        questionsData = response.data.questions;
      } else if (Array.isArray(response?.data)) {
        questionsData = response.data;
      } else if (Array.isArray(response)) {
        questionsData = response;
      }

      setQuestions(questionsData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshQuestions = useCallback(() => {
    return loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    loading,
    error,
    loadQuestions,
    refreshQuestions
  };
};
