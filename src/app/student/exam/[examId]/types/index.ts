import { Exam, Question, QuestionAnswerStatus, ExamSection } from "@/constants/types";

// ==============================================
// EXAM TIMER STATE
// ==============================================
export interface ExamTimerState {
  timeLeft: number;
  startTime: Date | null;
  questionStartTime: Date | null;
  examStarted: boolean;
  totalTimeSpent?: number;
  sectionTimes?: Record<string, number>;
  questionTimes?: Record<string, number>; // Added for individual question timing
  pausedTime?: number; // Track paused duration
}

// ==============================================
// EXAM NAVIGATION STATE
// ==============================================
export interface ExamNavigationState {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  currentQuestionId?: string;
  sectionId?: string;
  visitedQuestions?: Set<string>; // Track which questions were visited
  navigationHistory?: string[]; // Question ID history for back navigation
}

// ==============================================
// EXAM UI STATE
// ==============================================
export interface ExamUIState {
  loading: boolean;
  isOnBreak: boolean;
  showPasswordModal: boolean;
  showBreakModal: boolean;
  showSubmitDialog: boolean;
  password: string;
  passwordError: string;
  showPassword: boolean;
  isSubmitting?: boolean;
  error?: string;
  showQuestionNavigator?: boolean; // Toggle question navigator panel
  showInstructions?: boolean; // Show exam instructions modal
  isFullscreen?: boolean; // Fullscreen mode state
  breakStartTime?: Date; // When break was started
}

// ==============================================
// EXAM DATA STATE
// ==============================================
export interface ExamData {
  exam: Exam | null;
  currentQuestion: Question | null;
  currentSection: ExamSection | null;
  hasMultipleSections: boolean;
  totalQuestions: number;
  submissionId?: string;
  draftSubmissionId?: string; // For auto-save functionality
  examConfig?: ExamConfiguration; // Additional exam settings
}

// ==============================================
// EXAM CONFIGURATION
// ==============================================
export interface ExamConfiguration {
  allowBackNavigation: boolean;
  showQuestionNumbers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  preventCopyPaste: boolean;
  showTimer: boolean;
  warningThresholds: {
    time: number[]; // e.g., [300, 900] for 5min and 15min warnings
    questions: number[]; // e.g., [10, 5] for warnings at 10 and 5 questions left
  };
  autoSaveInterval: number; // Auto-save every N seconds
  maxBreakTime?: number; // Maximum break time in seconds
  maxBreaks?: number; // Maximum number of breaks allowed
}

// ==============================================
// COMPONENT PROPS INTERFACES
// ==============================================

export interface ExamHeaderProps {
  exam: Exam | null;
  examStarted: boolean;
  timeLeft: number;
  isOnBreak: boolean;
  answeredCount: number;
  totalQuestions: number;
  currentSectionIndex: number;
  onTakeBreak: () => void;
  onSubmitExam?: () => void;
  getTimeColor: () => string;
  formatTime: (seconds: number) => string;
  markedForReviewCount?: number;
  unansweredCount?: number;
  showQuestionProgress?: boolean;
  currentQuestionNumber?: number;
  breakCount?: number;
  maxBreaks?: number;
}

export interface QuestionNavigatorProps {
  exam: Exam | null;
  currentQuestionIndex: number;
  currentSectionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onQuestionSelect: (sectionIndex: number, questionIndex: number) => void;
  hasMultipleSections: boolean;
  answeredCount: number;
  markedForReviewCount: number;
  totalQuestions: number;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  unansweredCount?: number;
  visitedQuestions?: Set<string>;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export interface SectionNavigationProps {
  exam: Exam | null;
  currentSectionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onSectionChange: (index: number) => void;
  getSectionProgress: (section: ExamSection) => SectionProgressInfo;
  answers?: Record<string, number>;
  sectionTimes?: Record<string, number>;
  showTimeSpent?: boolean;
}

// Updated to match your new Question structure
export interface QuestionCardProps {
  question: Question | null;
  currentSection: ExamSection | null;
  currentQuestionIndex: number;
  hasMultipleSections: boolean;
  answer: number | undefined;
  questionStatus: QuestionAnswerStatus | undefined;
  onAnswerChange: (questionId: string, answerIndex: number) => void;
  exam: Exam | null;
  showExplanation?: boolean; // For practice mode
  isReviewMode?: boolean; // For result review
  questionNumber?: number; // Global question number
  totalQuestions?: number;
  timeSpentOnQuestion?: number;
}

export interface NavigationControlsProps {
  currentSectionIndex: number;
  currentQuestionIndex: number;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onMarkForReview: (questionId: string) => void;
  onSubmitExam: () => void;
  currentQuestion: Question | null;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  isSubmitting?: boolean;
  hasMultipleSections?: boolean;
  totalQuestions?: number;
  allowBackNavigation?: boolean;
  showQuestionNavigator?: boolean;
  onToggleNavigator?: () => void;
}

export interface QuestionNavigationPanelProps {
  exam: Exam | null;
  hasMultipleSections: boolean;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  questionStatuses: Record<string, QuestionAnswerStatus>;
  onQuestionNavigation: (index: number) => void;
  onSectionChange: (sectionIndex: number) => void;
  getQuestionStatusColor: (questionId: string) => string;
  getQuestionStatusIcon: (questionId: string) => React.ReactNode;
  getAnsweredCount: () => number;
  getMarkedForReviewCount: () => number;
  totalQuestions: number;
  answers?: Record<string, number>;
  timeLeft?: number;
  formatTime?: (seconds: number) => string;
  isVisible?: boolean;
  onClose?: () => void;
  sectionProgress?: Record<string, SectionProgressInfo>;
}

export interface PasswordModalProps {
  isOpen: boolean;
  password: string;
  passwordError: string;
  showPassword: boolean;
  isLoading?: boolean;
  examName?: string;
  onPasswordChange: (password: string) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export interface BreakModalProps {
  isOpen: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  getTimeColor: () => string;
  onResume: () => void;
  breakStartTime?: Date;
  maxBreakTime?: number;
  breakCount?: number;
  maxBreaks?: number;
  totalBreakTime?: number;
}

export interface SubmitDialogProps {
  isOpen: boolean;
  answeredCount: number;
  markedForReviewCount: number;
  totalQuestions: number;
  unansweredCount?: number;
  timeLeft?: number;
  formatTime?: (seconds: number) => string;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  showWarnings?: boolean;
  sectionProgress?: Record<string, SectionProgressInfo>;
  examName?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

export interface ExamInterfaceProps {
  examId: string;
  userId?: string;
  autoStart?: boolean;
  practiceMode?: boolean; // For practice exams with explanations
  reviewMode?: boolean; // For reviewing submitted exams
  submissionId?: string; // For review mode
  onExamComplete?: (submissionId: string) => void;
  onExamExit?: () => void;
  configuration?: Partial<ExamConfiguration>;
}

// ==============================================
// PROGRESS AND STATISTICS INTERFACES
// ==============================================

export interface ExamProgress {
  answered: number;
  markedForReview: number;
  unanswered: number;
  total: number;
  percentage: number;
  visited: number; // Questions that were viewed
  timeUtilization: number; // Percentage of time used
}

export interface SectionProgressInfo {
  sectionId: string;
  sectionName: string;
  answered: number;
  markedForReview: number;
  unanswered: number;
  visited: number;
  total: number;
  timeSpent?: number;
  timeLimit?: number;
  timeUtilization?: number;
  percentage: number;
  isCompleted: boolean;
}

export interface QuestionAnalytics {
  questionId: string;
  timeSpent: number;
  visitCount: number;
  answerChanges: number;
  finalAnswer?: number;
  wasMarkedForReview: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subject: string;
  topic: string;
}

export interface ExamStatistics {
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  sectionTimes: Record<string, number>;
  questionTimes: Record<string, number>;
  questionAnalytics: Record<string, QuestionAnalytics>;
  progress: ExamProgress;
  sectionProgress: SectionProgressInfo[];
  breakTimes: number[]; // Duration of each break
  totalBreakTime: number;
  navigationPattern: string[]; // Sequence of question IDs visited
  performanceMetrics: {
    timeEfficiency: number;
    completionRate: number;
    reviewUtilization: number;
  };
}

// ==============================================
// ENHANCED EXAM STATE MANAGEMENT
// ==============================================

export interface ExamState {
  timer: ExamTimerState;
  navigation: ExamNavigationState;
  ui: ExamUIState;
  data: ExamData;
  statistics: ExamStatistics;
  configuration: ExamConfiguration;
  session: ExamSessionInfo;
}

export interface ExamSessionInfo {
  sessionId: string;
  startedAt: Date;
  lastActivityAt: Date;
  breakSessions: BreakSession[];
  autoSaveEnabled: boolean;
  lastAutoSaveAt?: Date;
  examVersion: string; // Track exam version for consistency
  browserInfo?: {
    userAgent: string;
    viewport: { width: number; height: number };
    isFullscreen: boolean;
  };
}

export interface BreakSession {
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  reason?: 'manual' | 'automatic' | 'system';
}

// ==============================================
// ENHANCED ACTION TYPES
// ==============================================

export type ExamAction = 
  | { type: 'INITIALIZE_EXAM'; payload: { exam: Exam; configuration?: ExamConfiguration } }
  | { type: 'START_EXAM'; payload: { startTime: Date; timeLeft: number; sessionId: string } }
  | { type: 'UPDATE_TIMER'; payload: { timeLeft: number; questionTime?: number } }
  | { type: 'NAVIGATE_TO_QUESTION'; payload: { sectionIndex: number; questionIndex: number; questionId: string } }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: number; timeSpent?: number } }
  | { type: 'UPDATE_QUESTION_STATUS'; payload: { questionId: string; status: QuestionAnswerStatus } }
  | { type: 'MARK_QUESTION_VISITED'; payload: { questionId: string } }
  | { type: 'SET_LOADING'; payload: { loading: boolean; message?: string } }
  | { type: 'SET_ERROR'; payload: { error?: string } }
  | { type: 'START_BREAK'; payload: { breakTime: Date; reason?: string } }
  | { type: 'END_BREAK'; payload: { resumeTime: Date; breakDuration: number } }
  | { type: 'TOGGLE_SUBMIT_DIALOG'; payload: { show: boolean } }
  | { type: 'TOGGLE_QUESTION_NAVIGATOR'; payload: { show?: boolean } }
  | { type: 'SET_EXAM_DATA'; payload: ExamData }
  | { type: 'UPDATE_STATISTICS'; payload: Partial<ExamStatistics> }
  | { type: 'AUTO_SAVE'; payload: { submissionId: string; timestamp: Date } }
  | { type: 'SET_FULLSCREEN'; payload: { isFullscreen: boolean } }
  | { type: 'UPDATE_SESSION'; payload: Partial<ExamSessionInfo> }
  | { type: 'FINALIZE_EXAM'; payload: { submissionId: string; completedAt: Date } };

// ==============================================
// CONTEXT INTERFACES
// ==============================================

export interface ExamContextProps {
  children: React.ReactNode;
  examId: string;
  userId?: string;
  configuration?: Partial<ExamConfiguration>;
}

export interface ExamContextValue {
  state: ExamState;
  dispatch: React.Dispatch<ExamAction>;
  actions: {
    initializeExam: (exam: Exam) => void;
    startExam: () => Promise<void>;
    navigateToQuestion: (sectionIndex: number, questionIndex: number) => void;
    updateAnswer: (questionId: string, answer: number) => void;
    markForReview: (questionId: string) => void;
    clearAnswer: (questionId: string) => void;
    takeBreak: (reason?: string) => void;
    resumeExam: () => void;
    submitExam: () => Promise<string>;
    saveProgress: () => Promise<void>;
    toggleQuestionNavigator: () => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    getQuestionAnalytics: (questionId: string) => QuestionAnalytics | undefined;
    getSectionProgress: (sectionId: string) => SectionProgressInfo | undefined;
    calculateTimeWarning: () => { type: 'time' | 'questions' | null; threshold: number } | null;
  };
  utils: {
    formatTime: (seconds: number) => string;
    getTimeColor: (timeLeft: number, totalTime: number) => string;
    getQuestionStatusColor: (questionId: string) => string;
    getQuestionStatusIcon: (questionId: string) => React.ReactNode;
    calculateProgress: () => ExamProgress;
    getGlobalQuestionNumber: (sectionIndex: number, questionIndex: number) => number;
    canNavigateBack: () => boolean;
    canNavigateForward: () => boolean;
  };
}

// ==============================================
// EXAM RESULT AND REVIEW INTERFACES
// ==============================================

export interface ExamResultProps {
  submissionId: string;
  examId: string;
  showDetailedAnalysis?: boolean;
  allowReview?: boolean;
  onReviewQuestion?: (questionId: string) => void;
  onRetakeExam?: () => void;
}

export interface QuestionReviewProps {
  question: Question;
  userAnswer?: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  explanation?: {
    type: 'text' | 'image' | 'none';
    content?: string;
    image?: string;
  };
  showExplanation?: boolean;
  questionNumber: number;
  totalQuestions: number;
  onNext?: () => void;
  onPrevious?: () => void;
  marks: {
    positive: number;
    negative: number;
    earned: number;
  };
}

// ==============================================
// UTILITY TYPES
// ==============================================

export type ExamMode = 'normal' | 'practice' | 'review' | 'timed';
export type NavigationDirection = 'next' | 'previous' | 'jump';
export type QuestionDisplayMode = 'single' | 'all' | 'section';
export type TimerDisplayMode = 'full' | 'minimal' | 'hidden';

// ==============================================
// VALIDATION AND ERROR TYPES
// ==============================================

export interface ExamValidationError {
  type: 'missing_questions' | 'invalid_time' | 'section_mismatch' | 'configuration_error';
  message: string;
  details?: Record<string, any>;
}

export interface ExamWarning {
  type: 'time_running_out' | 'unanswered_questions' | 'unmarked_reviews' | 'connectivity_issue';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  dismissed?: boolean;
}
