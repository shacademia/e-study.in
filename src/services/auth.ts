import axios from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  SignupRequest, 
  User,
  ApiResponse,
  ApiError 
} from '@/constants/types';
import { AUTH_ROUTES } from '@/constants/api';

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

class AuthService {
  /**
   * User signup
   */
  async signup(data: SignupRequest): Promise<User> {
    try {
      const response = await authApi.post(AUTH_ROUTES.SIGNUP, data);
      
      // Your backend returns the user directly for signup (no token)
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * User login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post(AUTH_ROUTES.LOGIN, data);
      
      if (response.data.token) {
        this.setAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      } : {};

      const response = await authApi.get(AUTH_ROUTES.LOGOUT, config);
      
      this.clearAuthData();
      
      return response.data;
    } catch (error) {
      // Clear auth data even if logout request fails
      this.clearAuthData();
      throw this.handleError(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await authApi.get(AUTH_ROUTES.CURRENT_USER, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      
      return response.data.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
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
   * Refresh user data
   */
  async refreshUser(): Promise<User> {
    try {
      const user = await this.getCurrentUser();
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(['ADMIN']);
  }

  /**
   * Check if user is admin or moderator
   */
  isAdminOrModerator(): boolean {
    return this.hasRole(['ADMIN', 'MODERATOR']);
  }

  /**
   * Create axios config with auth headers
   */
  getAuthConfig() {
    const token = this.getToken();
    return token ? {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token
      }
    } : {};
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
