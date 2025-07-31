import { ExamRanking, Exam } from "@/constants/types";

export interface RankingsPageProps {
  initialRankings?: ExamRanking[];
  initialExams?: Exam[];
}

export interface RankingCardProps {
  ranking: ExamRanking;
  exams?: Exam[];
  showExamName?: boolean;
}

export interface RankingsHeaderProps {
  selectedExam: string;
  exams: Exam[];
  onExamFilterChange: (examId: string) => void;
  onBackNavigation: () => void;
}

export interface ExamFilterSelectProps {
  selectedExam: string;
  exams: Exam[];
  onExamFilterChange: (examId: string) => void;
}

export interface TopRankingsSectionProps {
  rankings: ExamRanking[];
  exams: Exam[];
}

export interface ExamRankingsSectionProps {
  rankingsByExam: Record<string, ExamRanking[]>;
}

export interface NoRankingsMessageProps {
  selectedExam: string;
}

export interface UserAvatarProps {
  userName: string;
}

export interface RankingBadgeProps {
  rank: number;
}

export type RankingFilter = "all" | string;
export type SortOrder = "asc" | "desc";
export type SortBy = "rank" | "score" | "percentage" | "completedAt";
