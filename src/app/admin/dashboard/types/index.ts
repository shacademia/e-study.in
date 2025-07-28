import { Exam, Question, User } from '@/constants/types';

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
}

export interface DashboardStats extends AdminStats {
  recentExams: Exam[]; // Most recent 5 exams
}

export type ExamFilter = 'all' | 'published' | 'draft';

export interface AdminDashboardState {
  exams: Exam[];
  questions: Question[];
  users: User[];
  adminStats: AdminStats | null;
  loading: boolean;
  showExamBuilder: boolean;
  showQuestionBank: boolean;
  showAddQuestionsDemo: boolean;
  recentlyDeletedExam: Exam | null;
  publishingExamId: string | null;
  editingExam: Exam | null;
  examFilter: ExamFilter;
  refreshingData: boolean;
  deletingAllExams: boolean;
}
