import { Exam, Submission, StudentRanking, User } from "@/constants/types";

export interface DashboardStats {
  totalExams: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  highestScore: number;
  totalExamsAttended: number;
  totalStudents: number;
  recentSubmissions?: Submission[];
}

export interface DashboardData {
  exams: Exam[];
  userSubmissions: Submission[];
  userRanking: StudentRanking | null;
  loading: boolean;
  userStats: DashboardStats;
  availableExams: Exam[];
  completedExams: Exam[];
  user: User | null;
}

export interface DashboardHeaderProps {
  userName?: string;
  onRankingsClick: () => void;
}

export interface WelcomeSectionProps {
  userName?: string;
}

export interface StatsCardsProps {
  stats: DashboardStats;
  userRanking: StudentRanking | null;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
}

export interface ProfilePerformanceProps {
  userName?: string;
  userEmail?: string;
  stats: DashboardStats;
  userRanking: StudentRanking | null;
}

export interface RecentActivityProps {
  recentSubmissions: Submission[];
  exams: Exam[];
}

export interface ExamsSectionProps {
  availableExams: Exam[];
  completedExams: Exam[];
  userStats: DashboardStats;
  onStartExam: (examId: string) => void;
  onViewResults: (examId: string) => void;
}

export interface ExamCardProps {
  exam: Exam;
  submission?: Submission;
  isCompleted: boolean;
  onStartExam: (examId: string) => void;
  onViewResults: (examId: string) => void;
}

export interface NoExamsMessageProps {
  type: 'available' | 'completed' | 'none';
}

export interface LoadingSpinnerProps {
  message?: string;
}

export type ExamStatus = 'available' | 'completed' | 'in-progress';
export type StatType = 'exams' | 'score' | 'rank' | 'students';
