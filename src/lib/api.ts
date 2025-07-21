import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { HTTP_STATUS, API_MESSAGES, STORAGE_KEYS } from '@/constants/constants';
import { ApiResponse, ApiError } from '@/constants/types';

// Create a custom axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-auth-token'] = token;
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', error.response?.status, error.response?.data);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request wrapper
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

// GET request wrapper
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'GET',
    url,
    ...config,
  });
}

// POST request wrapper
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'POST',
    url,
    data,
    ...config,
  });
}

// PUT request wrapper
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'PUT',
    url,
    data,
    ...config,
  });
}

// PATCH request wrapper
export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'PATCH',
    url,
    data,
    ...config,
  });
}

// DELETE request wrapper
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return apiRequest<T>({
    method: 'DELETE',
    url,
    ...config,
  });
}

// Handle API errors
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const data = response?.data;

    // Extract error message
    const errorMessage = 
      data?.error || 
      data?.message || 
      getStatusMessage(response?.status) ||
      API_MESSAGES.NETWORK_ERROR;

    return {
      success: false,
      error: errorMessage,
      message: data?.message,
      statusCode: response?.status,
    };
  }

  return {
    success: false,
    error: API_MESSAGES.NETWORK_ERROR,
    message: 'Please check your internet connection',
  };
}

// Get status message for HTTP status codes
function getStatusMessage(status?: number): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return API_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return API_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return API_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return API_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return 'Resource already exists';
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return API_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return API_MESSAGES.SERVER_ERROR;
    default:
      return API_MESSAGES.NETWORK_ERROR;
  }
}

// Build query string from object
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// Get auth config for requests
export function getAuthConfig(): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
      config.headers!['x-auth-token'] = token;
    }
  }

  return config;
}

// Set auth token
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }
}

// Get auth token
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
  return null;
}

// Clear auth token
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Upload file with progress
export async function uploadFile(
  url: string,
  file: File,
  additionalData?: Record<string, string>,
  onProgress?: (progressEvent: ProgressEvent) => void
): Promise<ApiResponse<unknown>> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return apiRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
}

// Retry failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

// Batch requests
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(request => request())
    );
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch request failed:', result.reason);
        throw result.reason;
      }
    });
  }
  
  return results;
}

// Cancel token for aborting requests
export const createCancelToken = () => axios.CancelToken.source();

// Check if error is a cancel error
export const isCancelError = (error: unknown) => axios.isCancel(error);

export default apiClient;
