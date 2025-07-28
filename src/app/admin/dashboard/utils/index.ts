// Dashboard utilities
import { Exam, Question, User } from '@/constants/types';
import { AdminStats, DashboardStats } from '../types';

/**
 * Calculate dashboard statistics from loaded data
 */
export const calculateDashboardStats = (
  exams: Exam[],
  questions: Question[],
  users: User[],
  adminStats: AdminStats | null
): DashboardStats => {
  // Prefer admin stats from API, fallback to calculated values from loaded data
  const totalExams = adminStats?.totalExams ?? exams.length;
  const publishedExams = adminStats?.publishedExams ?? exams.filter(exam => exam.isPublished === true).length;
  const draftExams = adminStats?.draftExams ?? exams.filter(exam => exam.isPublished === false || exam.isDraft === true).length;
  const totalQuestions = adminStats?.totalQuestions ?? questions.length;
  const totalUsers = adminStats?.totalUsers ?? users.length;
  const totalStudents = adminStats?.totalStudents ?? users.filter(user => user.role === 'USER').length;
  const totalAdmins = adminStats?.totalAdmins ?? users.filter(user => user.role === 'ADMIN').length;

  return {
    totalExams,
    publishedExams,
    draftExams,
    totalQuestions,
    totalUsers,
    totalStudents,
    totalAdmins,
    recentExams: exams.slice(0, 5), // Most recent 5 exams
  };
};

/**
 * Sort exams by creation date (newest first)
 */
export const sortExamsByDate = (exams: Exam[]): Exam[] => {
  return exams.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Filter exams based on filter type
 */
export const filterExams = (exams: Exam[], filter: 'all' | 'published' | 'draft'): Exam[] => {
  switch (filter) {
    case 'published':
      return exams.filter(exam => exam.isPublished === true);
    case 'draft':
      return exams.filter(exam => exam.isPublished === false || exam.isDraft === true);
    case 'all':
    default:
      return exams;
  }
};

/**
 * Parse API response to extract exams array
 */
export const parseExamsResponse = (response: unknown): Exam[] => {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    if ('data' in obj) {
      if (Array.isArray(obj.data)) {
        return obj.data;
      } else if (obj.data && typeof obj.data === 'object' && obj.data !== null) {
        const dataObj = obj.data as Record<string, unknown>;
        if ('exams' in dataObj && Array.isArray(dataObj.exams)) {
          return dataObj.exams;
        }
      }
    } else if ('exams' in obj && Array.isArray(obj.exams)) {
      return obj.exams;
    }
  }
  
  return [];
};

/**
 * Parse questions API response
 */
export const parseQuestionsResponse = (response: unknown): Question[] => {
  if (response && typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    if ('data' in obj && obj.data && typeof obj.data === 'object' && obj.data !== null) {
      const dataObj = obj.data as Record<string, unknown>;
      if ('questions' in dataObj && Array.isArray(dataObj.questions)) {
        return dataObj.questions;
      }
    }
  }
  return [];
};

/**
 * Parse users API response
 */
export const parseUsersResponse = (response: unknown): User[] => {
  if (response && typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    if ('data' in obj && Array.isArray(obj.data)) {
      return obj.data;
    }
  }
  return [];
};

/**
 * Parse admin stats API response
 */
export const parseAdminStatsResponse = (response: unknown): AdminStats | null => {
  if (response && typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    if ('data' in obj && obj.data && typeof obj.data === 'object' && obj.data !== null) {
      const dataObj = obj.data as Record<string, unknown>;
      if ('overview' in dataObj && dataObj.overview && typeof dataObj.overview === 'object' && dataObj.overview !== null) {
        const overview = dataObj.overview as Record<string, unknown>;
        return {
          totalUsers: Number(overview.totalUsers) || 0,
          totalStudents: Number(overview.totalStudents) || 0,
          totalAdmins: Number(overview.totalAdmins) || 0,
          totalExams: Number(overview.totalExams) || 0,
          totalQuestions: Number(overview.totalQuestions) || 0,
          publishedExams: Number(overview.publishedExams) || 0,
          draftExams: Number(overview.draftExams) || 0,
          totalSubmissions: Number(overview.totalSubmissions) || 0,
          completedSubmissions: Number(overview.completedSubmissions) || 0
        };
      }
    }
  }
  return null;
};
