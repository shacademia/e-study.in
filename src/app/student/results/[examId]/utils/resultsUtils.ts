import { Exam, Submission, Question } from '@/constants/types';

export const calculateResults = (exam: Exam, submission: Submission) => {
  // Safety checks
  if (!exam || !submission) {
    return {
      correctAnswers: 0,
      totalQuestions: 0,
      percentage: 0,
      grade: 'N/A',
    };
  }

  if (!submission.answers || typeof submission.answers !== 'object') {
    return {
      correctAnswers: 0,
      totalQuestions: 0,
      percentage: 0,
      grade: 'N/A',
    };
  }

  if (!exam.questions || !Array.isArray(exam.questions)) {
    return {
      correctAnswers: 0,
      totalQuestions: 0,
      percentage: 0,
      grade: 'N/A',
    };
  }

  try {
    const correctAnswers = exam.questions.filter((q: Question) => {
      if (!q || typeof q !== 'object' || !q.id) {
        return false;
      }
      
      const userAnswer = submission.answers[q.id];
      const isCorrect = userAnswer !== undefined && userAnswer === q.correctOption;
      
      return isCorrect;
    }).length;

    const totalQuestions = exam.questions.length;
    const percentage = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    const grade = getGrade(percentage);
    
    return {
      correctAnswers,
      totalQuestions,
      percentage,
      grade,
    };
  } catch (error) {
    console.error('calculateResults: Error during calculation:', error);
    return {
      correctAnswers: 0,
      totalQuestions: 0,
      percentage: 0,
      grade: 'Error',
    };
  }
};

export const getGrade = (percentage: number): string => {
  if (percentage >= 98) return 'AA';
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'F';
};

export const formatCompletionDate = (date: string | null): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};
