import { Submission, StudentRanking } from "@/constants/types";

export const calculateUserStats = (userSubmissions: Submission[], userRanking: StudentRanking | null) => {
  const submissions = Array.isArray(userSubmissions) ? userSubmissions : [];

  if (submissions.length === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      highestScore: 0,
      totalExamsAttended: 0,
      totalStudents: userRanking?.totalStudents || 0
    };
  }

  const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
  const totalQuestions = submissions.reduce((sum, sub) => sum + (sub.totalQuestions || 0), 0);
  const correctAnswers = submissions.reduce((sum, sub) => sum + (sub.statistics?.correctAnswers || 0), 0);
  const highestScore = Math.max(...submissions.map(sub => sub.score || 0));

  return {
    totalExams: submissions.length,
    totalExamsAttended: submissions.length,
    averageScore: submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0,
    totalQuestions,
    correctAnswers,
    highestScore,
    totalStudents: userRanking?.totalStudents || 0,
    recentSubmissions: submissions.slice(0, 3)
  };
};

export const calculateScorePercentage = (score: number, totalMarks: number): number => {
  return Math.round((score / totalMarks) * 100);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 98) return 'AA';
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'F';
};

export const formatTimeLimit = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};
