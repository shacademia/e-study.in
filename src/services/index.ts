// Export all services
export { authService } from './auth';
export { userService } from './user';
export { questionService } from './question';
export { examService } from './exam';
export { submissionService } from './submission';
export { rankingService } from './ranking';
export { adminService } from './admin';
export { searchService } from './search';
export { uploadService } from './upload';

// Export types
export type { 
  User, 
  Question, 
  Exam, 
  Submission,
  GlobalRanking,
  ExamRanking,
  StudentRanking,
  AdminStats,
  ApiResponse,
  ApiError
} from '@/constants/types';

// Re-export for convenience
export * from './auth';
export * from './user';
export * from './question';
export * from './exam';
export * from './submission';
export * from './ranking';
export * from './admin';
export * from './search';
export * from './upload';
