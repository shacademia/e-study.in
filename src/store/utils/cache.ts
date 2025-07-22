import { CACHE_CONFIG } from '../types';

/**
 * Check if cached data is still valid
 */
export const isCacheValid = (lastFetch: number | null): boolean => {
  if (!lastFetch) return false;
  
  const now = Date.now();
  const age = now - lastFetch;
  
  return age < CACHE_CONFIG.TTL;
};

/**
 * Check if cached data should be force refreshed
 */
export const shouldForceRefresh = (lastFetch: number | null): boolean => {
  if (!lastFetch) return true;
  
  const now = Date.now();
  const age = now - lastFetch;
  
  return age > CACHE_CONFIG.MAX_AGE;
};

/**
 * Get current timestamp for cache management
 */
export const getCurrentTimestamp = (): number => Date.now();

/**
 * Create a debounced function to prevent excessive API calls
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Create a throttled function to limit API call frequency
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Generate unique ID for notifications and other UI elements
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Safe async operation wrapper with error handling
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  errorMessage = 'Operation failed'
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error(errorMessage, error);
    
    // Enhanced error handling for API errors
    let errorMsg = errorMessage;
    
    // Handle ApiError type from question service
    if (error && typeof error === 'object') {
      if ('error' in error && error.error) {
        // Extract the detailed error message
        errorMsg = String(error.error);
      } else if ('message' in error) {
        errorMsg = String(error.message);
      } else if ('response' in error && error.response && typeof error.response === 'object') {
        // Handle Axios error format
        const response = error.response as { status?: number; data?: { error?: string; message?: string; [key: string]: unknown } };
        if (response.data && typeof response.data === 'object') {
          if (response.data.error) {
            errorMsg = String(response.data.error);
          } else if (response.data.message) {
            errorMsg = String(response.data.message);
          } else if ('details' in response.data && response.data.details) {
            errorMsg = String(response.data.details);
          }
        }
      }
    } else if (error instanceof Error) {
      errorMsg = error.message;
    }
    
    return { data: null, error: errorMsg };
  }
};

/**
 * Deep clone utility for state immutability
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const copy = {} as T;
    Object.keys(obj as Record<string, unknown>).forEach(key => {
      (copy as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return copy;
  }
  return obj;
};

/**
 * Merge state updates while maintaining immutability
 */
export const mergeState = <T extends object>(current: T, updates: Partial<T>): T => {
  return { ...current, ...updates };
};
