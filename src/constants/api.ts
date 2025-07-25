// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Authentication Routes
export const AUTH_ROUTES = {
  SIGNUP: '/api/users/signup',
  LOGIN: '/api/users/login',
  LOGOUT: '/api/users/logout',
  CURRENT_USER: '/api/users/me',
} as const;

// User Management Routes
export const USER_ROUTES = {
  ALL_USERS: '/api/users/all',
  ADMINS: '/api/users/admins',
  UPDATE_PROFILE: '/api/users/updateuserprofile',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  UPDATE_ROLE: (id: string) => `/api/users/${id}/role`,
  DELETE_USER: (id: string) => `/api/users/${id}`,
  USER_SUBMISSIONS: (id: string) => `/api/users/${id}/submissions`,
  CURRENT_USER: '/api/users/me',
} as const;

// Question Management Routes
export const QUESTION_ROUTES = {
  CREATE: '/api/questions/create',
  ALL_QUESTIONS: '/api/questions',
  QUESTION_BY_ID: (id: string) => `/api/questions/${id}`,
  UPDATE_QUESTION: (id: string) => `/api/questions/${id}`,
  DELETE_QUESTION: (id: string) => `/api/questions/${id}`,
  SUBJECTS: '/api/questions/subjects',
  TOPICS: '/api/questions/topics',
} as const;

// Exam Management Routes
export const EXAM_ROUTES = {
  CREATE: '/api/exams',
  ALL_EXAMS: '/api/exams',
  EXAM_BY_ID: (id: string) => `/api/exams/${id}`,
  UPDATE_EXAM: (id: string) => `/api/exams/${id}`,
  DELETE_EXAM: (id: string) => `/api/exams/${id}`,
  PUBLISH_EXAM: (id: string) => `/api/exams/${id}/publish`,
  VALIDATE_PASSWORD: (id: string) => `/api/exams/${id}/validate-password`,
  EXAM_SECTIONS: (id: string) => `/api/exams/${id}/sections`,
  EXAM_SECTION_BY_ID: (examId: string, sectionId: string) => `/api/exams/exam/${examId}/sections/${sectionId}`,
  EXAM_SECTION_QUESTIONS: (examId: string, sectionId: string) => `/api/exams/exam/${examId}/sections/${sectionId}/questions`,
  REMOVE_QUESTION_FROM_SECTION: (examId: string, sectionId: string, questionId: string) => 
    `/api/exams/exam/${examId}/sections/${sectionId}/questions/${questionId}`,
  EXAM_SUBMISSIONS: (id: string) => `/api/exams/${id}/submissions`,
  EXAM_RANKINGS: (id: string) => `/api/exams/exam/${id}/rankings`,
} as const;

// Submission Routes
export const SUBMISSION_ROUTES = {
  ALL_SUBMISSIONS: '/api/submissions',
  SUBMISSION_BY_ID: (id: string) => `/api/submissions/${id}`,
  UPDATE_SUBMISSION: (id: string) => `/api/submissions/${id}`,
  DELETE_SUBMISSION: (id: string) => `/api/submissions/${id}`,
  SUBMIT_EXAM: (examId: string) => `/api/submissions`,
  DRAFT_SUBMISSION: '/api/submissions/draft',
  USER_SUBMISSIONS: (userId: string) => `/api/submissions/user/${userId}`,
  EXAM_SUBMISSIONS: (examId: string) => `/api/submissions/exam/${examId}`,
} as const;

// Rankings Routes
export const RANKING_ROUTES = {
  GLOBAL_RANKINGS: '/api/rankings',
  GLOBAL_RANKINGS_ALT: '/api/rankings/global',
  EXAM_RANKINGS: (examId: string) => `/api/rankings/exam/${examId}`,
  STUDENT_RANKING: '/api/student/ranking',
} as const;

// Admin Routes
export const ADMIN_ROUTES = {
  STATS: '/api/admin/stats',
  ALL_USERS: '/api/admin/users',
} as const;

// Search Routes
export const SEARCH_ROUTES = {
  SEARCH_EXAMS: '/api/search/exams',
  SEARCH_QUESTIONS: '/api/search/questions',
} as const;

// Upload Routes
export const UPLOAD_ROUTES = {
  PROFILE_IMAGE: '/api/upload/profile-image',
  QUESTION_IMAGE: '/api/upload/question-image',
} as const;

// All API Routes combined
export const API_ROUTES = {
  ...AUTH_ROUTES,
  ...USER_ROUTES,
  ...QUESTION_ROUTES,
  ...EXAM_ROUTES,
  ...SUBMISSION_ROUTES,
  ...RANKING_ROUTES,
  ...ADMIN_ROUTES,
  ...SEARCH_ROUTES,
  ...UPLOAD_ROUTES,
} as const;

export type ApiRoutes = (typeof API_ROUTES)[keyof typeof API_ROUTES];