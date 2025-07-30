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

// Options interface for load more functionality
interface UseQuestionsOptions {
  reset?: boolean;
  loadMore?: boolean;
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // Track if more questions available
  const [currentPage, setCurrentPage] = useState(1); // Track current page

  const loadQuestions = useCallback(async (
    params: UseQuestionsParams = {}, 
    options: UseQuestionsOptions = {} // Second parameter for options
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine which page to fetch
      let pageToFetch = params.page || 1;
      if (options.loadMore) {
        pageToFetch = currentPage + 1;
      } else if (options.reset) {
        pageToFetch = 1;
        setCurrentPage(1);
      }

      const response = await questionService.getAllQuestions({
        page: pageToFetch,
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

      if (options.reset) {
        // Reset: replace all questions
        setQuestions(questionsData);
        setCurrentPage(1);
      } else if (options.loadMore) {
        // Load more: append to existing questions
        setQuestions(prev => [...prev, ...questionsData]);
        setCurrentPage(pageToFetch);
      } else {
        // Default behavior (backward compatibility)
        setQuestions(questionsData);
        setCurrentPage(pageToFetch);
      }

      // Update hasMore based on whether we got a full batch
      const limit = params.limit || 50;
      setHasMore(questionsData.length === limit);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      if (options.reset || !options.loadMore) {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const refreshQuestions = useCallback(() => {
    setCurrentPage(1);
    return loadQuestions({}, { reset: true });
  }, [loadQuestions]);

  return {
    questions,
    loading,
    error,
    hasMore,
    loadQuestions,
    refreshQuestions
  };
};
