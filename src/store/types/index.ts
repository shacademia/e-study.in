import { Exam, Question, User, CreateExamRequest, CreateQuestionRequest, UpdateQuestionRequest } from '@/constants/types';

// Payload types for actions
export interface SaveExamWithSectionsPayload {
  exam: {
    name: string;
    description?: string;
    timeLimit: number;
    isPasswordProtected?: boolean;
    password?: string;
    instructions?: string;
    isPublished?: boolean;
    isDraft?: boolean;
  };
  sections: {
    id: string;
    name: string;
    description?: string;
    timeLimit?: number;
    questions: {
      questionId: string;
      order: number;
      marks: number;
    }[];
  }[];
}

// Store State Interfaces
export interface ExamState {
  exams: Exam[];
  currentExam: Exam | null;
  examForEdit: {
    exam: Exam;
    sections: Array<{
      id: string;
      name: string;
      description?: string;
      timeLimit?: number;
      marks?: number;
      questionsCount: number;
      questions: Array<{
        id: string;
        questionId: string;
        order: number;
        marks: number;
        question: Question;
      }>;
      createdAt: string;
      updatedAt: string;
    }>;
  } | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface QuestionState {
  questions: Question[];
  filteredQuestions: Question[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  filters: {
    subject: string;
    difficulty: string;
    topic: string;
    search: string;
  };
}

export interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface UIState {
  examBuilder: {
    activeSection: number;
    selectedQuestions: Set<string>;
    showQuestionSelector: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
  }>;
  modals: {
    [key: string]: boolean;
  };
}

// Store Actions Interfaces
export interface ExamActions {
  // Fetch actions
  fetchExams: () => Promise<void>;
  fetchExamForEdit: (examId: string) => Promise<void>;
  
  // CRUD actions
  createExam: (examData: CreateExamRequest) => Promise<Exam | null>;
  updateExam: (examId: string, examData: Partial<CreateExamRequest>) => Promise<Exam | null>;
  deleteExam: (examId: string) => Promise<boolean>;
  saveExamWithSections: (examId: string, payload: SaveExamWithSectionsPayload) => Promise<boolean>;
  
  // State actions
  setCurrentExam: (exam: Exam | null) => void;
  clearExamForEdit: () => void;
  clearError: () => void;
  reset: () => void;
}

export interface QuestionActions {
  // Fetch actions
  fetchQuestions: () => Promise<void>;
  fetchQuestionsWithFilters: (filters: {
    search?: string;
    subject?: string;
    difficulty?: string;
    topic?: string;
  }) => Promise<void>;
  
  // CRUD actions
  createQuestion: (data: CreateQuestionRequest) => Promise<Question>;
  updateQuestion: (id: string, updates: UpdateQuestionRequest) => Promise<Question>;
  deleteQuestion: (id: string) => Promise<{ message: string }>;
  
  // Filter actions
  setFilters: (filters: Partial<QuestionState['filters']>) => Promise<void>;
  resetFilters: () => void;
  
  // State actions
  clearError: () => void;
  reset: () => void;
}

export interface UserActions {
  // Fetch actions
  fetchCurrentUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // State actions
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
  reset: () => void;
}

export interface UIActions {
  // Exam Builder
  setActiveSection: (index: number) => void;
  toggleQuestionSelection: (questionId: string) => void;
  clearSelectedQuestions: () => void;
  setShowQuestionSelector: (show: boolean) => void;
  
  // Notifications
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modals
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  closeAllModals: () => void;
}

// Combined Store Types
export interface ExamStore extends ExamState, ExamActions {}
export interface QuestionStore extends QuestionState, QuestionActions {}
export interface UserStore extends UserState, UserActions {}
export interface UIStore extends UIState, UIActions {}

// Cache configuration
export interface CacheConfig {
  TTL: number; // Time to live in milliseconds
  MAX_AGE: number; // Maximum age before force refresh
}

export const CACHE_CONFIG: CacheConfig = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_AGE: 15 * 60 * 1000, // 15 minutes
};
