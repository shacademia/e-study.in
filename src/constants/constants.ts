// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Messages
export const API_MESSAGES = {
  // Success messages
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  
  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  
  // Error messages
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Internal server error',
  
  // Specific messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password is too weak',
  INVALID_TOKEN: 'Invalid or expired token',
} as const;

// API Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PROFILE_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// Exam Configuration
export const EXAM_CONFIG = {
  MIN_TIME_LIMIT: 5, // minutes
  MAX_TIME_LIMIT: 300, // minutes (5 hours)
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 200,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  WARNING_TIME: 5, // minutes before auto-submit
} as const;

// Question Configuration
export const QUESTION_CONFIG = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  MAX_CONTENT_LENGTH: 5000,
  MAX_OPTION_LENGTH: 500,
  MIN_MARKS: 1,
  MAX_MARKS: 100,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_SUBMISSIONS: 'user_submissions',
  EXAM_LIST: 'exam_list',
  QUESTION_LIST: 'question_list',
  RANKINGS: 'rankings',
  ADMIN_STATS: 'admin_stats',
  SEARCH_HISTORY: 'search_history',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  EXAM_DRAFT: 'exam_draft',
  SEARCH_HISTORY_EXAMS: 'search_history_exams',
  SEARCH_HISTORY_QUESTIONS: 'search_history_questions',
  PREFERENCES: 'user_preferences',
} as const;

// Sorting Options
export const SORT_OPTIONS = {
  USERS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    NAME: 'name',
    EMAIL: 'email',
    ROLE: 'role',
  },
  EXAMS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    NAME: 'name',
    TIME_LIMIT: 'timeLimit',
  },
  QUESTIONS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    SUBJECT: 'subject',
    DIFFICULTY: 'difficulty',
  },
  SUBMISSIONS: {
    CREATED_AT: 'createdAt',
    SCORE: 'score',
    COMPLETED_AT: 'completedAt',
    TIME_SPENT: 'timeSpent',
  },
  RANKINGS: {
    RANK: 'rank',
    SCORE: 'score',
    PERCENTAGE: 'percentage',
    COMPLETED_AT: 'completedAt',
  },
} as const;

// Date Formats
export const DATE_FORMATS = {
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
} as const;

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ApiMessage = (typeof API_MESSAGES)[keyof typeof API_MESSAGES];
export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
