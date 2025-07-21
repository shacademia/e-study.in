import axios from 'axios';
import { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest,
  QuestionFilters,
  ApiResponse,
  ApiError,
  Subject,
  SubjectTopicsResponse,
  Pagination
} from '@/constants/types';
import { QUESTION_ROUTES } from '@/constants/api';
import { authService } from './auth';

class QuestionService {
  /**
   * Create a new question
   */
  async createQuestion(data: CreateQuestionRequest): Promise<Question> {
    try {
      const response = await axios.post(
        QUESTION_ROUTES.CREATE,
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all questions with filters
   */
  async getAllQuestions(filters?: QuestionFilters): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.ALL_QUESTIONS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<Question> {
    try {
      const response = await axios.get(
        QUESTION_ROUTES.QUESTION_BY_ID(id),
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update question
   */
  async updateQuestion(id: string, data: UpdateQuestionRequest): Promise<Question> {
    try {
      const response = await axios.put(
        QUESTION_ROUTES.UPDATE_QUESTION(id),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        QUESTION_ROUTES.DELETE_QUESTION(id),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all subjects
   */
  async getAllSubjects(): Promise<string[] | Subject[]> {
    try {
      const response = await axios.get(
        QUESTION_ROUTES.SUBJECTS,
        authService.getAuthConfig()
      );
      
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get topics by subject
   */
  async getTopicsBySubject(subject: string, includeStats = false): Promise<SubjectTopicsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('subject', subject);
      if (includeStats) {
        params.append('includeStats', 'true');
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.TOPICS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search questions
   */
  async searchQuestions(searchQuery: string, filters?: Omit<QuestionFilters, 'search'>): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.ALL_QUESTIONS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get questions by subject
   */
  async getQuestionsBySubject(subject: string, filters?: Omit<QuestionFilters, 'subject'>): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('subject', subject);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.ALL_QUESTIONS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get questions by difficulty
   */
  async getQuestionsByDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD', filters?: Omit<QuestionFilters, 'difficulty'>): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('difficulty', difficulty);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.ALL_QUESTIONS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get questions by tags
   */
  async getQuestionsByTags(tags: string[], filters?: Omit<QuestionFilters, 'tags'>): Promise<ApiResponse<{ questions: Question[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('tags', tags.join(','));
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${QUESTION_ROUTES.ALL_QUESTIONS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload question image
   */
  async uploadQuestionImage(file: File, questionId?: string): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (questionId) {
        formData.append('questionId', questionId);
      }

      const authConfig = authService.getAuthConfig();
      const response = await axios.post(
        '/api/upload/question-image',
        formData,
        {
          ...authConfig,
          headers: {
            ...authConfig.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(questions: CreateQuestionRequest[]): Promise<Question[]> {
    try {
      const createdQuestions: Question[] = [];
      
      // Process questions one by one (you can modify this to handle batch API if available)
      for (const questionData of questions) {
        const question = await this.createQuestion(questionData);
        createdQuestions.push(question);
      }
      
      return createdQuestions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get question statistics
   */
  async getQuestionStats(): Promise<{
    totalQuestions: number;
    byDifficulty: Record<string, number>;
    bySubject: Record<string, number>;
    topAuthors: Array<{ name: string; count: number }>;
  }> {
    try {
      // This would need a dedicated API endpoint, for now we'll simulate
      const allQuestions = await this.getAllQuestions({ limit: 1000 });
      
      const questions = allQuestions.data.questions;
      const totalQuestions = questions.length;
      
      const byDifficulty: Record<string, number> = {};
      const bySubject: Record<string, number> = {};
      const authorCounts: Record<string, number> = {};
      
      questions.forEach(question => {
        // Count by difficulty
        byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] || 0) + 1;
        
        // Count by subject
        bySubject[question.subject] = (bySubject[question.subject] || 0) + 1;
        
        // Count by author
        const authorName = question.author.name;
        authorCounts[authorName] = (authorCounts[authorName] || 0) + 1;
      });
      
      const topAuthors = Object.entries(authorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalQuestions,
        byDifficulty,
        bySubject,
        topAuthors
      };
    } catch (error) {
      throw this.handleError(error);
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
   * Check if current user can create questions
   */
  canCreateQuestions(): boolean {
    return authService.hasRole(['ADMIN', 'MODERATOR']);
  }

  /**
   * Check if current user can edit question
   */
  canEditQuestion(question: Question): boolean {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    
    // Admin can edit any question
    if (currentUser.role === 'ADMIN') return true;
    
    // Author can edit their own question
    if (question.author.id === currentUser.id) return true;
    
    return false;
  }

  /**
   * Check if current user can delete question
   */
  canDeleteQuestion(question: Question): boolean {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    
    // Admin can delete any question
    if (currentUser.role === 'ADMIN') return true;
    
    // Author can delete their own question
    if (question.author.id === currentUser.id) return true;
    
    return false;
  }
}

// Export singleton instance
export const questionService = new QuestionService();
export default questionService;
