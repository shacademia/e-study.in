import axios from 'axios';
import { 
  AdminStats,
  AdminStatsFilters,
  AdminUserFilters,
  User,
  ApiResponse,
  ApiError,
  Pagination 
} from '@/constants/types';
import { ADMIN_ROUTES, USER_ROUTES } from '@/constants/api';
import { authService } from './auth';

interface AdminAnalyticsResponse {
  overview: {
    totalUsers: number;
    totalExams: number;
    totalQuestions: number;
    totalSubmissions: number;
    growth: {
      users: number;
      exams: number;
      questions: number;
      submissions: number;
    };
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    examActivity: Array<{ date: string; count: number }>;
    submissionTrends: Array<{ date: string; count: number }>;
    subjectDistribution: Array<{ subject: string; count: number }>;
    difficultyDistribution: Array<{ difficulty: string; count: number }>;
  };
  performance: {
    averageScore: number;
    completionRate: number;
    topPerformers: Array<{ userId: string; userName: string; score: number }>;
  };
}

interface AdminOverviewResponse {
  metrics: {
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalExams: number;
    publishedExams: number;
    draftExams: number;
    totalQuestions: number;
    totalSubmissions: number;
    completedSubmissions: number;
  };
  growth: {
    todayUsers: number;
    todaySubmissions: number;
    todayExams: number;
    weeklyUsers: number;
    weeklySubmissions: number;
    weeklyExams: number;
    monthlyUsers: number;
    monthlySubmissions: number;
    monthlyExams: number;
  };
  activity: {
    recentUsers: Array<{ id: string; name: string; email: string; createdAt: string }>;
    recentExams: Array<{ id: string; name: string; createdBy: string; createdAt: string }>;
    recentSubmissions: Array<{ id: string; userName: string; examName: string; score: number; createdAt: string }>;
  };
  distribution: {
    roleDistribution: Array<{ role: string; count: number }>;
    examStatusDistribution: Array<{ status: string; count: number }>;
    submissionStatusDistribution: Array<{ status: string; count: number }>;
  };
}

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(filters?: AdminStatsFilters): Promise<ApiResponse<AdminStats>> {
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
        `${ADMIN_ROUTES.STATS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed analytics
   */
  async getAnalytics(filters?: {
    timeframe?: '7d' | '30d' | '90d' | '180d' | '1y' | 'all';
    metric?: 'engagement' | 'performance' | 'difficulty' | 'subjects' | 'trends' | 'all';
    groupBy?: 'day' | 'week' | 'month';
    includeComparisons?: boolean;
  }): Promise<ApiResponse<AdminAnalyticsResponse>> {
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
        '/api/admin/analytics',
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get admin overview
   */
  async getOverview(): Promise<ApiResponse<AdminOverviewResponse>> {
    try {
      const response = await axios.get(
        '/api/admin/overview',
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all users (Admin interface)
   */
  async getAllUsers(filters?: AdminUserFilters): Promise<ApiResponse<{ users: User[]; pagination: Pagination }>> {
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
        `${ADMIN_ROUTES.ALL_USERS}?${params}`,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST';
  }): Promise<ApiResponse<User>> {
    try {
      const response = await axios.post(
        ADMIN_ROUTES.ALL_USERS,
        data,
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, role: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST'): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(
        USER_ROUTES.UPDATE_ROLE(userId),
        { role },
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axios.delete(
        USER_ROUTES.DELETE_USER(userId),
        authService.getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get admin users data
   */
  async getAdminUsersData(): Promise<ApiResponse<User[]>> {
    try {
      const response = await axios.get(
        USER_ROUTES.ADMINS,
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
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return authService.hasRole(['ADMIN']);
  }

  /**
   * Check if current user can access admin features
   */
  canAccessAdmin(): boolean {
    return authService.hasRole(['ADMIN', 'MODERATOR']);
  }

  /**
   * Format large numbers for display
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Calculate growth percentage
   */
  calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
