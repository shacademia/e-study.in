import { apiClient } from '@/lib/api';
import { API_ROUTES } from '@/constants/api';
import { 
  User, 
  ApiResponse, 
  UpdateProfileRequest,
  UpdateRoleRequest,
  AdminUserFilters,
  Pagination
} from '@/constants/types';

interface UserActivity {
  id: string;
  userId: string;
  activity: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}

class UserService {
  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters?: AdminUserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.active) params.append('active', filters.active);

    const response = await apiClient.get<PaginatedResponse<User>>(
      `${API_ROUTES.ALL_USERS}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ROUTES.USER_BY_ID(userId)
    );
    return response.data.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      '/api/users/updateuserprofile',
      data
    );
    return response.data.data;
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, data: UpdateRoleRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ROUTES.UPDATE_ROLE(userId),
      data
    );
    return response.data.data;
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(API_ROUTES.DELETE_USER(userId));
  }

  /**
   * Suspend user (Admin only)
   */
  async suspendUser(userId: string, data: { reason?: string; duration?: number }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      `${API_ROUTES.USER_BY_ID(userId)}/suspend`,
      data
    );
    return response.data.data;
  }

  /**
   * Reactivate suspended user (Admin only)
   */
  async reactivateUser(userId: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      `${API_ROUTES.USER_BY_ID(userId)}/reactivate`
    );
    return response.data.data;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalExamsTaken: number;
    averageScore: number;
    totalQuestionsSolved: number;
    correctAnswers: number;
    incorrectAnswers: number;
    rank: number;
    joinedDate: string;
  }> {
    const response = await apiClient.get(
      `${API_ROUTES.USER_BY_ID(userId)}/stats`
    );
    return response.data.data;
  }

  /**
   * Change user password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    console.log('🔄 Sending password change request:', { url: '/api/users/change-password', method: 'PUT' });
    const response = await apiClient.put<{ success: boolean; message: string }>(
      '/api/users/change-password',
      data
    );
    console.log('✅ Password change response:', response.data);
    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/api/users/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await apiClient.post('/api/users/reset-password', data);
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<{ 
    user: User; 
    upload: { id: string; url: string; fileName: string; fileSize: number } 
  }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<{ 
      user: User; 
      upload: { id: string; url: string; fileName: string; fileSize: number } 
    }>>(
      '/api/users/upload-profile-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<{
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    examSettings: {
      autoSubmit: boolean;
      showTimer: boolean;
      allowReview: boolean;
    };
  }> {
    const response = await apiClient.get('/api/users/preferences');
    return response.data.data;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    examSettings?: {
      autoSubmit?: boolean;
      showTimer?: boolean;
      allowReview?: boolean;
    };
  }): Promise<void> {
    await apiClient.put('/api/users/preferences', preferences);
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    activityType?: string;
  }): Promise<PaginatedResponse<UserActivity>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.activityType) params.append('activityType', filters.activityType);

    const response = await apiClient.get<PaginatedResponse<UserActivity>>(
      `${API_ROUTES.USER_BY_ID(userId)}/activity?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Bulk update users (Admin only)
   */
  async bulkUpdateUsers(data: {
    userIds: string[];
    updates: Partial<User>;
  }): Promise<{ updated: number; failed: string[] }> {
    const response = await apiClient.put<ApiResponse<{ updated: number; failed: string[] }>>(
      `${API_ROUTES.ALL_USERS}/bulk-update`,
      data
    );
    return response.data.data;
  }

  /**
   * Export users data (Admin only)
   */
  async exportUsers(filters?: AdminUserFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.active && filters.active !== 'all') params.append('active', filters.active);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(
      `${API_ROUTES.ALL_USERS}/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ROUTES.CURRENT_USER
    );
    return response.data.data;
  }

  /**
   * Send email verification code
   */
  async sendEmailVerification(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/api/users/send-verification'
    );
    return response.data;
  }

  /**
   * Verify email with code
   */
  async verifyEmail(code: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(
      '/api/users/verify-email',
      { code }
    );
    return response.data.data;
  }

  /**
   * Get user submissions
   */
  async getUserSubmissions(userId: string, filters?: {
    page?: number;
    limit?: number;
    examId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<unknown>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.examId) params.append('examId', filters.examId);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<PaginatedResponse<unknown>>(
      `${API_ROUTES.USER_SUBMISSIONS(userId)}?${params.toString()}`
    );
    return response.data;
  }
}

// Export singleton instance
export const userService = new UserService();
