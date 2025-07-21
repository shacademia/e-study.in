import axios from 'axios';
import { 
  Exam, 
  CreateExamRequest, 
  UpdateExamRequest,
  ExamFilters,
  ExamSection,
  CreateSectionRequest,
  UpdateSectionRequest,
  AddQuestionsToSectionRequest,
  ValidatePasswordRequest,
  PublishExamRequest,
  ApiResponse,
  ApiError,
  Pagination,
  Question
} from '@/constants/types';
import { EXAM_ROUTES } from '@/constants/api';
import { authService } from './auth';

class ExamService {
  /**
   * Create a new exam
   */
  async createExam(data: CreateExamRequest): Promise<Exam> {
    try {
      const response = await axios.post(
        EXAM_ROUTES.CREATE,
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all exams with filters
   */
  async getAllExams(filters?: ExamFilters): Promise<ApiResponse<{ exams: Exam[]; pagination: Pagination }>> {
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
        `${EXAM_ROUTES.ALL_EXAMS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exam by ID
   */
  async getExamById(id: string): Promise<Exam> {
    try {
      const response = await axios.get(
        EXAM_ROUTES.EXAM_BY_ID(id),
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update exam
   */
  async updateExam(id: string, data: UpdateExamRequest): Promise<Exam> {
    try {
      const response = await axios.put(
        EXAM_ROUTES.UPDATE_EXAM(id),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete exam
   */
  async deleteExam(id: string): Promise<{ message: string; data: { deletedExamId: string } }> {
    try {
      const response = await axios.delete(
        EXAM_ROUTES.DELETE_EXAM(id),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Publish or unpublish exam
   */
  async publishExam(id: string, data: PublishExamRequest): Promise<Exam> {
    try {
      const response = await axios.post(
        EXAM_ROUTES.PUBLISH_EXAM(id),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate exam password
   */
  async validateExamPassword(id: string, data: ValidatePasswordRequest): Promise<{ isValid: boolean; examId: string }> {
    try {
      const response = await axios.post(
        EXAM_ROUTES.VALIDATE_PASSWORD(id),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== EXAM SECTIONS =====

  /**
   * Create exam section
   */
  async createExamSection(examId: string, data: CreateSectionRequest): Promise<ExamSection> {
    try {
      const response = await axios.post(
        EXAM_ROUTES.EXAM_SECTIONS(examId),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all sections for an exam
   */
  async getExamSections(examId: string): Promise<ExamSection[]> {
    try {
      const response = await axios.get(
        EXAM_ROUTES.EXAM_SECTIONS(examId),
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific section
   */
  async getExamSectionById(examId: string, sectionId: string): Promise<ExamSection> {
    try {
      const response = await axios.get(
        EXAM_ROUTES.EXAM_SECTION_BY_ID(examId, sectionId),
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update exam section
   */
  async updateExamSection(examId: string, sectionId: string, data: UpdateSectionRequest): Promise<ExamSection> {
    try {
      const response = await axios.put(
        EXAM_ROUTES.EXAM_SECTION_BY_ID(examId, sectionId),
        data,
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete exam section
   */
  async deleteExamSection(examId: string, sectionId: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        EXAM_ROUTES.EXAM_SECTION_BY_ID(examId, sectionId),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add questions to section
   */
  async addQuestionsToSection(examId: string, sectionId: string, data: AddQuestionsToSectionRequest): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        EXAM_ROUTES.EXAM_SECTION_QUESTIONS(examId, sectionId),
        data,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get questions in section
   */
  async getSectionQuestions(examId: string, sectionId: string): Promise<Question[]> {
    try {
      const response = await axios.get(
        EXAM_ROUTES.EXAM_SECTION_QUESTIONS(examId, sectionId),
        authService.getAuthConfig()
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove question from section
   */
  async removeQuestionFromSection(examId: string, sectionId: string, questionId: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        EXAM_ROUTES.REMOVE_QUESTION_FROM_SECTION(examId, sectionId, questionId),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Search exams
   */
  async searchExams(searchQuery: string, filters?: Omit<ExamFilters, 'search'>): Promise<ApiResponse<{ exams: Exam[]; pagination: Pagination }>> {
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
        `${EXAM_ROUTES.ALL_EXAMS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get published exams only
   */
  async getPublishedExams(filters?: Omit<ExamFilters, 'published'>): Promise<ApiResponse<{ exams: Exam[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('published', 'true');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${EXAM_ROUTES.ALL_EXAMS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get draft exams only
   */
  async getDraftExams(filters?: Omit<ExamFilters, 'published'>): Promise<ApiResponse<{ exams: Exam[]; pagination: Pagination }>> {
    try {
      const params = new URLSearchParams();
      params.append('published', 'false');
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axios.get(
        `${EXAM_ROUTES.ALL_EXAMS}?${params.toString()}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exam statistics
   */
  async getExamStats(): Promise<{
    totalExams: number;
    publishedExams: number;
    draftExams: number;
    totalSections: number;
    averageTimeLimit: number;
  }> {
    try {
      // This would need a dedicated API endpoint, for now we'll simulate
      const allExams = await this.getAllExams({ limit: 1000 });
      
      const exams = allExams.data.exams;
      const totalExams = exams.length;
      const publishedExams = exams.filter(exam => exam.isPublished).length;
      const draftExams = exams.filter(exam => exam.isDraft).length;
      const totalSections = exams.reduce((sum, exam) => sum + (exam.sectionsCount || 0), 0);
      const averageTimeLimit = exams.reduce((sum, exam) => sum + exam.timeLimit, 0) / totalExams;
      
      return {
        totalExams,
        publishedExams,
        draftExams,
        totalSections,
        averageTimeLimit
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
   * Check if current user can create exams
   */
  canCreateExams(): boolean {
    return authService.hasRole(['ADMIN', 'MODERATOR']);
  }

  /**
   * Check if current user can edit exam
   */
  canEditExam(exam: Exam): boolean {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    
    // Admin can edit any exam
    if (currentUser.role === 'ADMIN') return true;
    
    // Moderator can edit any exam
    if (currentUser.role === 'MODERATOR') return true;
    
    // Creator can edit their own exam
    if (exam.createdBy.id === currentUser.id) return true;
    
    return false;
  }

  /**
   * Check if current user can delete exam
   */
  canDeleteExam(exam: Exam): boolean {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    
    // Admin can delete any exam
    if (currentUser.role === 'ADMIN') return true;
    
    // Creator can delete their own exam if it's not published
    if (exam.createdBy.id === currentUser.id && !exam.isPublished) return true;
    
    return false;
  }

  /**
   * Check if current user can publish exam
   */
  canPublishExam(exam: Exam): boolean {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    
    // Admin can publish any exam
    if (currentUser.role === 'ADMIN') return true;
    
    // Moderator can publish any exam
    if (currentUser.role === 'MODERATOR') return true;
    
    // Creator can publish their own exam
    if (exam.createdBy.id === currentUser.id) return true;
    
    return false;
  }
}

// Export singleton instance
export const examService = new ExamService();
export default examService;
