import axios from 'axios';
import { 
  SearchExamFilters,
  SearchQuestionFilters,
  Exam,
  Question,
  ApiResponse,
  ApiError,
  Pagination 
} from '@/constants/types';
import { SEARCH_ROUTES } from '@/constants/api';
import { authService } from './auth';

class SearchService {
  /**
   * Search exams
   */
  async searchExams(filters: SearchExamFilters): Promise<ApiResponse<{ exams: Exam[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${SEARCH_ROUTES.SEARCH_EXAMS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search questions
   */
  async searchQuestions(filters: SearchQuestionFilters): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${SEARCH_ROUTES.SEARCH_QUESTIONS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Quick search across multiple entities
   */
  async quickSearch(query: string, entities: Array<'exams' | 'questions'> = ['exams', 'questions']): Promise<{
    exams?: ApiResponse<{ exams: Exam[]; pagination: Pagination }>;
    questions?: ApiResponse<{ questions: Question[]; pagination: Pagination }>;
  }> {
    try {
      const promises: Promise<{ type: string; data?: unknown; error?: ApiError }>[] = [];
      const results: {
        exams?: ApiResponse<{ exams: Exam[]; pagination: Pagination }>;
        questions?: ApiResponse<{ questions: Question[]; pagination: Pagination }>;
      } = {};

      if (entities.includes('exams')) {
        promises.push(
          this.searchExams({ q: query, limit: 10 })
            .then(data => ({ type: 'exams', data }))
            .catch(error => ({ type: 'exams', error: this.handleError(error) }))
        );
      }

      if (entities.includes('questions')) {
        promises.push(
          this.searchQuestions({ q: query, limit: 10 })
            .then(data => ({ type: 'questions', data }))
            .catch(error => ({ type: 'questions', error: this.handleError(error) }))
        );
      }

      const responses = await Promise.allSettled(promises);
      
      responses.forEach((response) => {
        if (response.status === 'fulfilled') {
          const { type, data, error } = response.value;
          if (error) {
            console.error(`Search error for ${type}:`, error);
          } else {
            if (type === 'exams') {
              results.exams = data as ApiResponse<{ exams: Exam[]; pagination: Pagination }>;
            } else if (type === 'questions') {
              results.questions = data as ApiResponse<{ questions: Question[]; pagination: Pagination }>;
            }
          }
        }
      });

      return results;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search with autocomplete suggestions
   */
  async getSearchSuggestions(query: string, type: 'exams' | 'questions' = 'exams'): Promise<ApiResponse<string[]>> {
    try {
      const filters = type === 'exams' 
        ? { q: query, limit: 5 }
        : { q: query, limit: 5 };

      const response = type === 'exams'
        ? await this.searchExams(filters as SearchExamFilters)
        : await this.searchQuestions(filters as SearchQuestionFilters);

      if (response.success) {
        const data = response.data as { exams?: Exam[]; questions?: Question[] };
        const items = type === 'exams' 
          ? (data.exams || [])
          : (data.questions || []);
        
        const suggestions = items.map((item: Exam | Question) => {
          return type === 'exams' ? (item as Exam).name : (item as Question).content.substring(0, 100);
        });

        return {
          success: true,
          data: suggestions
        };
      }

      return {
        success: false,
        data: []
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(params: {
    query?: string;
    entityType: 'exams' | 'questions';
    filters?: Record<string, string | number | boolean>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ items: (Exam | Question)[]; pagination: Pagination }>> {
    try {
      const { query, entityType, filters = {}, sortBy, sortOrder, page, limit } = params;
      
      const searchFilters = {
        ...(query && { q: query }),
        ...filters,
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(page && { page }),
        ...(limit && { limit }),
      };

      if (entityType === 'exams') {
        const response = await this.searchExams(searchFilters as SearchExamFilters);
        return {
          success: response.success,
          data: {
            items: response.data.exams,
            pagination: response.data.pagination
          }
        };
      } else {
        const response = await this.searchQuestions(searchFilters as SearchQuestionFilters);
        return {
          success: response.success,
          data: {
            items: response.data.questions,
            pagination: response.data.pagination
          }
        };
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get search history (client-side storage)
   */
  getSearchHistory(type: 'exams' | 'questions' | 'all' = 'all'): string[] {
    try {
      const key = `search_history_${type}`;
      const history = localStorage.getItem(key);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Save search query to history
   */
  saveToSearchHistory(query: string, type: 'exams' | 'questions' = 'exams'): void {
    try {
      if (!query.trim()) return;

      const key = `search_history_${type}`;
      const history = this.getSearchHistory(type);
      
      // Remove if already exists and add to beginning
      const filteredHistory = history.filter(item => item !== query);
      const newHistory = [query, ...filteredHistory].slice(0, 10); // Keep only last 10 searches
      
      localStorage.setItem(key, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Clear search history
   */
  clearSearchHistory(type: 'exams' | 'questions' | 'all' = 'all'): void {
    try {
      if (type === 'all') {
        localStorage.removeItem('search_history_exams');
        localStorage.removeItem('search_history_questions');
      } else {
        localStorage.removeItem(`search_history_${type}`);
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      
      return {
        success: false,
        error: responseData?.error || responseData?.message || 'An error occurred',
        message: responseData?.message,
        statusCode: error.response?.status,
      };
    }
    
    return {
      success: false,
      error: 'Network error occurred',
      message: 'Please check your internet connection',
    };
  }

  /**
   * Highlight search terms in text
   */
  highlightSearchTerms(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Build search filters from URL params
   */
  parseSearchParams(searchParams: URLSearchParams): SearchExamFilters & SearchQuestionFilters {
    const filters: Record<string, string | number | boolean> = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (value) {
        // Convert string values to appropriate types
        if (key === 'page' || key === 'limit' || key === 'minTimeLimit' || key === 'maxTimeLimit') {
          filters[key] = parseInt(value, 10);
        } else if (key === 'isPublished' || key === 'hasPassword') {
          filters[key] = value === 'true';
        } else {
          filters[key] = value;
        }
      }
    }
    
    return filters as SearchExamFilters & SearchQuestionFilters;
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;
