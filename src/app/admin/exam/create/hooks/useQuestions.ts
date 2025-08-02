import { useState, useCallback } from 'react';
import { Question } from '@/constants/types';
import { questionService } from '@/services/question';

interface UseQuestionsParams {
  page?: number;
  limit?: number;
  subject?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
  tags?: string;
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
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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
        pageToFetch = params.page || 1;
      } else {
        // When no options are specified, use the page from params
        pageToFetch = params.page || 1;
      }
      
      // Update current page state immediately
      console.log(`🔄 useQuestions: Setting current page to ${pageToFetch}`, { params, options });
      setCurrentPage(pageToFetch);

      const limit = params.limit || 20;
      setItemsPerPage(limit);

      const response = await questionService.getAllQuestions({
        page: pageToFetch,
        limit: limit,
        subject: params.subject,
        difficulty: params.difficulty,
        topic: params.topic,
        tags: params.tags,
        search: params.search
      });

      let questionsData: Question[] = [];
      let paginationData = null;

      if (response?.data?.questions) {
        questionsData = response.data.questions;
        paginationData = response.data.pagination;
      } else if (Array.isArray(response?.data)) {
        questionsData = response.data;
      } else if (Array.isArray(response)) {
        questionsData = response;
      }

      // Update pagination info
      if (paginationData) {
        console.log(`📊 Pagination data from API:`, paginationData);
        setTotalQuestions(paginationData.totalItems || 0);
        setTotalPages(paginationData.totalPages || 1);
        setHasMore(paginationData.hasNextPage || false);
      } else {
        console.log(`⚠️ No pagination data from API, using fallback`);
        // Fallback pagination calculation
        setTotalQuestions(questionsData.length);
        setTotalPages(Math.ceil(questionsData.length / limit));
        setHasMore(questionsData.length === limit);
      }

      if (options.reset) {
        // Reset: replace all questions
        setQuestions(questionsData);
        // currentPage is already set above
      } else if (options.loadMore) {
        // Load more: append to existing questions
        setQuestions(prev => [...prev, ...questionsData]);
        // currentPage is already set above
      } else {
        // Default behavior (backward compatibility)
        setQuestions(questionsData);
        // currentPage is already set above
      }

      // hasMore is already set above based on API response
      
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
    currentPage,
    totalQuestions,
    totalPages,
    itemsPerPage,
    loadQuestions,
    refreshQuestions
  };
};
