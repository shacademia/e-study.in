import axios from 'axios';
import { 
  GlobalRanking,
  ExamRanking,
  StudentRanking,
  RankingFilters,
  ApiResponse,
  ApiError,
  Pagination 
} from '@/constants/types';
import { RANKING_ROUTES } from '@/constants/api';
import { authService } from './auth';

class RankingService {
  /**
   * Get global rankings
   */
  async getGlobalRankings(filters?: RankingFilters): Promise<ApiResponse<{ rankings: GlobalRanking[]; pagination: Pagination }>> {
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
        `${RANKING_ROUTES.GLOBAL_RANKINGS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get global rankings (alternative route)
   */
  async getGlobalRankingsAlt(filters?: RankingFilters): Promise<ApiResponse<{ rankings: GlobalRanking[]; pagination: Pagination }>> {
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
        `${RANKING_ROUTES.GLOBAL_RANKINGS_ALT}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get rankings for specific exam
   */
  async getExamRankings(examId: string, filters?: RankingFilters): Promise<ApiResponse<{ rankings: ExamRanking[]; pagination: Pagination }>> {
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
        `${RANKING_ROUTES.EXAM_RANKINGS(examId)}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get student ranking
   */
  async getStudentRanking(filters?: RankingFilters): Promise<ApiResponse<StudentRanking>> {
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
        `${RANKING_ROUTES.STUDENT_RANKING}?${params}`,
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
   * Format ranking position with suffix
   */
  formatRankPosition(rank: number): string {
    const suffixes = ['st', 'nd', 'rd'];
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${rank}th`;
    }
    
    return `${rank}${suffixes[lastDigit - 1] || 'th'}`;
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(rank: number, totalStudents: number): number {
    return Math.round(((totalStudents - rank) / totalStudents) * 100);
  }
}

// Export singleton instance
export const rankingService = new RankingService();
export default rankingService;
