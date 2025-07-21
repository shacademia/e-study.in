import axios from 'axios';
import { 
  Submission,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  SubmissionFilters,
  DraftSubmissionRequest,
  ApiResponse,
  ApiError,
  Pagination 
} from '@/constants/types';
import { SUBMISSION_ROUTES } from '@/constants/api';
import { authService } from './auth';

class SubmissionService {
  /**
   * Get all submissions with filters
   */
  async getAllSubmissions(filters?: SubmissionFilters): Promise<ApiResponse<{ submissions: Submission[]; pagination: Pagination }>> {
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
        `${SUBMISSION_ROUTES.ALL_SUBMISSIONS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    try {
      const response = await axios.get(
        SUBMISSION_ROUTES.SUBMISSION_BY_ID(id),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update submission
   */
  async updateSubmission(id: string, data: UpdateSubmissionRequest): Promise<ApiResponse<Submission>> {
    try {
      const response = await axios.put(
        SUBMISSION_ROUTES.UPDATE_SUBMISSION(id),
        data,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete submission (Admin only)
   */
  async deleteSubmission(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axios.delete(
        SUBMISSION_ROUTES.DELETE_SUBMISSION(id),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit exam
   */
  async submitExam(examId: string, data: CreateSubmissionRequest): Promise<ApiResponse<Submission>> {
    try {
      const response = await axios.post(
        SUBMISSION_ROUTES.SUBMIT_EXAM(examId),
        data,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Save draft submission
   */
  async saveDraftSubmission(data: DraftSubmissionRequest): Promise<ApiResponse<Submission>> {
    try {
      const response = await axios.post(
        SUBMISSION_ROUTES.DRAFT_SUBMISSION,
        data,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get submissions for specific exam (Admin only)
   */
  async getExamSubmissions(examId: string, filters?: SubmissionFilters): Promise<ApiResponse<{ submissions: Submission[]; pagination: Pagination }>> {
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
        `${SUBMISSION_ROUTES.EXAM_SUBMISSIONS(examId)}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user submissions
   */
  async getUserSubmissions(userId: string, filters?: SubmissionFilters): Promise<ApiResponse<{ submissions: Submission[]; pagination: Pagination }>> {
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
        `${SUBMISSION_ROUTES.USER_SUBMISSIONS(userId)}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get draft submissions
   */
  async getDraftSubmissions(filters?: SubmissionFilters): Promise<ApiResponse<{ submissions: Submission[]; pagination: Pagination }>> {
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
        `${SUBMISSION_ROUTES.DRAFT_SUBMISSION}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
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
   * Check if current user can manage submissions
   */
  canManageSubmissions(): boolean {
    return authService.hasRole(['ADMIN', 'MODERATOR']);
  }

  /**
   * Check if current user can view all submissions
   */
  canViewAllSubmissions(): boolean {
    return authService.hasRole(['ADMIN', 'MODERATOR']);
  }
}

// Export singleton instance
export const submissionService = new SubmissionService();
export default submissionService;
