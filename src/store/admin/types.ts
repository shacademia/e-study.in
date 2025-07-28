import { Exam, Question, User } from '@/constants/types';

// Base admin state interfaces
export interface AdminStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  publishedExams: number;
  draftExams: number;
  totalStudents?: number;
  totalAdmins?: number;
  totalSubmissions?: number;
  completedSubmissions?: number;
  recentExams?: Exam[];
}

export interface DashboardMetrics {
  userGrowth: Array<{ date: string; count: number }>;
  examActivity: Array<{ date: string; count: number }>;
  submissionTrends: Array<{ date: string; count: number }>;
  topPerformers: Array<{ userId: string; userName: string; averageScore: number }>;
}

// Filter types
export interface ExamFilter {
  status?: 'all' | 'published' | 'draft' | 'archived';
  search?: string;
}

export interface UserFilter {
  role?: 'all' | 'student' | 'admin' | 'active' | 'inactive';
  search?: string;
}
export type QuestionFilter = {
  subject?: string;
  topic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  search?: string;
};

// UI state interfaces
export interface UIState {
  activeTab: 'dashboard' | 'exams' | 'questions' | 'users' | 'analytics';
  sidebarCollapsed: boolean;
  modals: {
    createExam: boolean;
    editExam: boolean;
    deleteExam: boolean;
    createQuestion: boolean;
    editQuestion: boolean;
    deleteQuestion: boolean;
    bulkActions: boolean;
  };
  loading: {
    dashboard: boolean;
    exams: boolean;
    questions: boolean;
    users: boolean;
    analytics: boolean;
  };
  errors: {
    dashboard?: string;
    exams?: string;
    questions?: string;
    users?: string;
    analytics?: string;
  };
}

// Selection and bulk operations
export interface SelectionState {
  selectedExams: Set<string>;
  selectedQuestions: Set<string>;
  selectedUsers: Set<string>;
  bulkActionMode: boolean;
}

// Pagination
export interface PaginationState {
  exams: {
    page: number;
    limit: number;
    total: number;
  };
  questions: {
    page: number;
    limit: number;
    total: number;
  };
  users: {
    page: number;
    limit: number;
    total: number;
  };
}

// Main admin store state
export interface AdminStoreState {
  // Data
  stats: AdminStats | null;
  metrics: DashboardMetrics | null;
  exams: Exam[];
  questions: Question[];
  users: User[];
  
  // Filters
  examFilter: ExamFilter;
  userFilter: UserFilter;
  questionFilter: QuestionFilter;
  
  // UI State
  activeTab: 'dashboard' | 'exams' | 'questions' | 'users' | 'analytics';
  sidebarCollapsed: boolean;
  modals: {
    createExam: boolean;
    editExam: boolean;
    deleteExam: boolean;
    createQuestion: boolean;
    editQuestion: boolean;
    deleteQuestion: boolean;
    bulkActions: boolean;
  };
  loading: {
    dashboard: boolean;
    exams: boolean;
    questions: boolean;
    users: boolean;
    analytics: boolean;
  };
  errors: {
    dashboard?: string;
    exams?: string;
    questions?: string;
    users?: string;
    analytics?: string;
  };
  
  // Selection
  selectedExams: Set<string>;
  selectedQuestions: Set<string>;
  selectedUsers: Set<string>;
  bulkActionMode: boolean;
  
  // Pagination
  examPagination: {
    page: number;
    limit: number;
    total: number;
  };
  questionPagination: {
    page: number;
    limit: number;
    total: number;
  };
  userPagination: {
    page: number;
    limit: number;
    total: number;
  };
  
  // Recently modified data for optimistic updates
  recentlyModified: {
    exams: Set<string>;
    questions: Set<string>;
    users: Set<string>;
  };
}

// Action types
export interface AdminActions {
  // Stats and metrics
  setStats: (stats: AdminStats) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  
  // Data management
  setExams: (exams: Exam[]) => void;
  setQuestions: (questions: Question[]) => void;
  setUsers: (users: User[]) => void;
  addExam: (exam: Exam) => void;
  updateExam: (examId: string, updates: Partial<Exam>) => void;
  removeExam: (examId: string) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  removeQuestion: (questionId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // Filters
  setExamFilter: (filter: ExamFilter) => void;
  setUserFilter: (filter: UserFilter) => void;
  setQuestionFilter: (filter: Partial<QuestionFilter>) => void;
  resetFilters: () => void;
  
  // UI State
  setActiveTab: (tab: 'dashboard' | 'exams' | 'questions' | 'users' | 'analytics') => void;
  toggleSidebar: () => void;
  openModal: (modal: keyof AdminStoreState['modals']) => void;
  closeModal: (modal: keyof AdminStoreState['modals']) => void;
  setLoading: (section: keyof AdminStoreState['loading'], loading: boolean) => void;
  setError: (section: keyof AdminStoreState['errors'], error: string) => void;
  clearErrors: () => void;
  
  // Selection and bulk operations
  toggleExamSelection: (examId: string) => void;
  toggleQuestionSelection: (questionId: string) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllExams: () => void;
  selectAllQuestions: () => void;
  selectAllUsers: () => void;
  clearAllSelections: () => void;
  setBulkActionMode: (enabled: boolean) => void;
  
  // Pagination
  setExamPagination: (pagination: Partial<AdminStoreState['examPagination']>) => void;
  setQuestionPagination: (pagination: Partial<AdminStoreState['questionPagination']>) => void;
  setUserPagination: (pagination: Partial<AdminStoreState['userPagination']>) => void;
  
  // Optimistic updates
  markAsRecentlyModified: (type: 'exams' | 'questions' | 'users', id: string) => void;
  
  // Utility actions
  reset: () => void;
  refreshData: () => void;
}

// Combined store type
export type AdminStore = AdminStoreState & AdminActions;

// Query key factories
export const adminQueryKeys = {
  all: ['admin'] as const,
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  metrics: (timeRange?: string) => [...adminQueryKeys.all, 'metrics', { timeRange }] as const,
  exams: (filter?: ExamFilter, page?: number, limit?: number) => 
    [...adminQueryKeys.all, 'exams', { filter, page, limit }] as const,
  exam: (id: string) => [...adminQueryKeys.all, 'exam', id] as const,
  questions: (filter?: QuestionFilter, page?: number, limit?: number) =>
    [...adminQueryKeys.all, 'questions', { filter, page, limit }] as const,
  question: (id: string) => [...adminQueryKeys.all, 'question', id] as const,
  users: (filter?: UserFilter, page?: number, limit?: number) =>
    [...adminQueryKeys.all, 'users', { filter, page, limit }] as const,
  user: (id: string) => [...adminQueryKeys.all, 'user', id] as const,
  analytics: (type: string, timeRange?: string) =>
    [...adminQueryKeys.all, 'analytics', type, { timeRange }] as const,
} as const;
