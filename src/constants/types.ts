// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST';
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name?: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  bio?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateRoleRequest {
  role: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST';
}

// Question Types
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  
  // Legacy content field (kept for backward compatibility)
  content: string;
  questionImage?: string; // ImageKit URL for question image (legacy)
  
  // 3-Layer Question System
  layer1Type: 'text' | 'image' | 'none';
  layer1Text?: string;
  layer1Image?: string;
  layer2Type: 'text' | 'image' | 'none';
  layer2Text?: string;
  layer2Image?: string;
  layer3Type: 'text' | 'image' | 'none';
  layer3Text?: string;
  layer3Image?: string;
  
  // Enhanced Options System
  options: string[];
  optionImages?: string[]; // Array of ImageKit URLs for option images
  optionTypes: ('text' | 'image')[]; // Type for each option (text or image)
  correctOption: number;
  
  // Marking System
  positiveMarks: number;
  negativeMarks: number;
  
  // Explanation System
  explanationType: 'text' | 'image' | 'none';
  explanationText?: string;
  explanationImage?: string;

  difficulty: QuestionDifficulty;
  subject: string;
  topic: string;
  tags: string[];
  marks?: number; // Legacy field (can be replaced by positiveMarks/negativeMarks)
  author: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  // Legacy fields (for backward compatibility)
  content: string;
  questionImage?: string;
  
  // 3-Layer Question System
  layer1Type: 'text' | 'image' | 'none';
  layer1Text?: string;
  layer1Image?: string;
  layer2Type: 'text' | 'image' | 'none';
  layer2Text?: string;
  layer2Image?: string;
  layer3Type: 'text' | 'image' | 'none';
  layer3Text?: string;
  layer3Image?: string;
  
  // Enhanced Options System
  options: string[];
  optionImages?: string[];
  optionTypes: ('text' | 'image')[]; // Type for each option
  correctOption: number;
  
  // Marking System
  positiveMarks: number;
  negativeMarks: number;
  
  // Explanation System
  explanationType: 'text' | 'image' | 'none';
  explanationText?: string;
  explanationImage?: string;
  
  difficulty: QuestionDifficulty;
  subject: string;
  topic: string;
  tags?: string[];
  marks?: number; // Legacy field
}

export interface UpdateQuestionRequest {
  // Legacy fields
  content?: string;
  questionImage?: string;
  
  // 3-Layer Question System
  layer1Type?: 'text' | 'image' | 'none';
  layer1Text?: string;
  layer1Image?: string;
  layer2Type?: 'text' | 'image' | 'none';
  layer2Text?: string;
  layer2Image?: string;
  layer3Type?: 'text' | 'image' | 'none';
  layer3Text?: string;
  layer3Image?: string;
  
  // Enhanced Options System
  options?: string[];
  optionImages?: string[];
  optionTypes?: ('text' | 'image')[]; // Type for each option
  correctOption?: number;
  
  // Marking System
  positiveMarks?: number;
  negativeMarks?: number;
  
  // Explanation System
  explanationType?: 'text' | 'image' | 'none';
  explanationText?: string;
  explanationImage?: string;
  
  difficulty?: QuestionDifficulty;
  subject?: string;
  topic?: string;
  tags?: string[];
  marks?: number; // Legacy field
}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  subject?: string;
  difficulty?: QuestionDifficulty;
  search?: string;
  tags?: string;
  authorId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'subject' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

// Exam Types
export interface Exam {
  id: string;
  name: string;
  description?: string;
  timeLimit: number;
  isPasswordProtected: boolean;
  password?: string;
  instructions?: string;
  isPublished: boolean;
  isDraft: boolean;
  totalMarks: number;
  questionsCount: number;
  sectionsCount?: number;
  submissionsCount?: number;
  createdBy: {
    id: string;
    name: string;
    email?: string;
  };
  sections?: ExamSection[];
  questions?: Question[];
  _count?: {
    questions?: number;
    sections?: number;
    submissions?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  name: string;
  description?: string;
  timeLimit: number;
  isPasswordProtected?: boolean;
  password?: string;
  instructions?: string;
}

export interface UpdateExamRequest {
  name?: string;
  description?: string;
  timeLimit?: number;
  isPasswordProtected?: boolean;
  password?: string;
  instructions?: string;
  isPublished?: boolean;
  isDraft?: boolean;
}

export interface ExamFilters {
  page?: number;
  limit?: number;
  published?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ValidatePasswordRequest {
  password: string;
}

export interface PublishExamRequest {
  isPublished: boolean;
}

// Exam Section Types
export interface ExamSection {
  id: string;
  name: string;
  description?: string;
  timeLimit?: number;
  marks?: number;
  examId: string;
  questionsCount: number;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  name: string;
  description?: string;
  timeLimit?: number;
  marks?: number;
}

export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  timeLimit?: number;
  marks?: number;
}

export interface AddQuestionsToSectionRequest {
  questionIds: string[];
  marks?: number;
}

// Submission Types
export type QuestionStatus = 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW';

export interface QuestionAnswerStatus {
  status: QuestionStatus;
  answer?: number;
  timeSpent: number;
}

export interface Submission {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, number>;
  questionStatuses?: Record<string, QuestionAnswerStatus>;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  totalTimeSpent?: number;
  isSubmitted: boolean;
  completedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  exam?: {
    id: string;
    name: string;
    totalMarks: number;
    timeLimit?: number;
  };
  statistics?: SubmissionStatistics;
  questionAnalysis?: QuestionAnalysis[];
  subjectAnalysis?: Record<string, SubjectAnalysis>;
  performance?: {
    grade: string;
    remarks: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionStatistics {
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  percentage: number;
  accuracy: number;
  timeUtilization: number;
}

export interface QuestionAnalysis {
  questionId: string;
  question: string;
  userAnswer: number;
  correctOption: number;
  isCorrect: boolean;
  timeSpent: number;
  marks: number;
  earnedMarks: number;
}

export interface SubjectAnalysis {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  totalMarks: number;
  earnedMarks: number;
}

export interface CreateSubmissionRequest { 
  examId: string;
  answers: Record<string, number>;
  questionStatuses?: Record<string, QuestionAnswerStatus>;
  score?: number;
  timeSpent?: number;
  totalTimeSpent?: number;
  isSubmitted?: boolean;
  sectionTimes?: Record<string, number>;
  totalQuestions: number;

}

export interface UpdateSubmissionRequest {
  answers?: Record<string, number>;
  questionStatuses?: Record<string, QuestionAnswerStatus>;
  timeSpent?: number;
  isSubmitted?: boolean;
}

export interface SubmissionFilters {
  page?: number;
  limit?: number;
  examId?: string;
  userId?: string;
  sortBy?: 'createdAt' | 'score' | 'completedAt' | 'timeSpent';
  sortOrder?: 'asc' | 'desc';
  includeDetails?: boolean;
  status?: 'submitted' | 'draft' | 'all';
  includeStats?: boolean;
}

export interface DraftSubmissionRequest {
  examId: string;
  answers?: Record<string, number>;
  questionStatuses?: Record<string, QuestionAnswerStatus>;
  timeSpent?: number;
  currentQuestionId?: string;
  sectionId?: string;
}

// Rankings Types
export interface GlobalRanking {
  rank: number;
  userId: string;
  userName: string;
  userEmail?: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  examsTaken: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface ExamRanking {
  rank: number;
  userId: string;
  userName: string;
  userEmail?: string;
  score: number;
  totalScore: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  submission?: {
    id: string;
    isSubmitted: boolean;
  };
}

export interface StudentRanking {
  globalRank: number;
  totalStudents: number;
  percentile: number;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  examsTaken: number;
  averageScore: number;
  recentPerformance: {
    examId: string;
    examName: string;
    score: number;
    rank: number;
    totalParticipants: number;
  }[];
}

export interface RankingFilters {
  page?: number;
  limit?: number;
  sortBy?: 'rank' | 'score' | 'percentage' | 'completedAt' | 'averageScore' | 'totalExams' | 'highestScore' | 'recentActivity';
  sortOrder?: 'asc' | 'desc';
  includeUserDetails?: boolean;
  includeExamDetails?: boolean;
  includeStats?: boolean;
  timeframe?: '7d' | '30d' | '90d' | 'all';
  userId?: string;
}

// Admin Types
export interface AdminStats {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalExams: number;
    publishedExams: number;
    draftExams: number;
    totalQuestions: number;
    totalSubmissions: number;
    completedSubmissions: number;
  };
  growth: {
    newUsers: number;
    newExams: number;
    newQuestions: number;
    newSubmissions: number;
  };
  examStats: {
    averageTimeLimit: number;
    averageTotalMarks: number;
    totalSections: number;
  };
  submissionStats: {
    averageScore: number;
    averageTimeSpent: number;
    completionRate: number;
  };
  topSubjects: {
    subject: string;
    count: number;
  }[];
  topUsers: {
    userId: string;
    userName: string;
    averagePercentage: number;
    examCount: number;
  }[];
  popularExams: {
    examId: string;
    examName: string;
    submissionCount: number;
  }[];
  systemHealth: {
    activeUserRate: number;
    examCompletionRate: number;
    systemUptimeHours: number;
  };
}

export interface AdminStatsFilters {
  timeframe?: '7d' | '30d' | '90d' | 'all';
  includeRecent?: boolean;
  includeCharts?: boolean;
}

export interface AdminUserFilters {
  page?: number;
  limit?: number;
  role?: 'ADMIN' | 'USER' | 'MODERATOR' | 'GUEST' | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email' | 'role';
  sortOrder?: 'asc' | 'desc';
  includeStats?: boolean;
  active?: 'true' | 'false' | 'all';
}

// Search Types
export interface SearchExamFilters {
  q?: string;
  isPublished?: boolean;
  creatorId?: string;
  hasPassword?: boolean;
  minTimeLimit?: number;
  maxTimeLimit?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'timeLimit';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuestionFilters {
  q?: string;
  subject?: string;
  difficulty?: QuestionDifficulty;
  topic?: string;
  tags?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'difficulty' | 'subject';
  sortOrder?: 'asc' | 'desc';
}

// Upload Types
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
  message: string;
}

// Pagination Types
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Generic API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
  filters?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

// Subject and Topic Types
export interface Subject {
  name: string;
  count: number;
  questionCount?: number;
  examCount?: number;
}

export interface Topic {
  name: string;
  count: number;
  questionCount?: number;
}

export interface SubjectTopicsResponse {
  subject: string;
  topics: string[] | Topic[];
}
