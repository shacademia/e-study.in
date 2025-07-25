import { ExamSection, Question } from '@/constants/types';

/**
 * Get difficulty color for badges
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty?.toUpperCase()) {
    case 'EASY':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'HARD':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Calculate total questions across all sections
 */
export const calculateTotalQuestions = (sections: ExamSection[]): number => {
  return sections.reduce((total, section) => total + (section.questions?.length || 0), 0);
};

/**
 * Calculate total marks across all sections
 */
export const calculateTotalMarks = (sections: ExamSection[]): number => {
  return sections.reduce((total, section) => total + (section.marks || 0), 0);
};

/**
 * Calculate total time across all sections
 */
export const calculateTotalTime = (sections: ExamSection[]): number => {
  return sections.reduce((total, section) => total + (section.timeLimit || 0), 0);
};

/**
 * Validate exam data before saving
 */
export const validateExamData = (
  examDetails: { title: string; description: string },
  sections: ExamSection[],
  status: 'draft' | 'published'
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic validation
  if (!examDetails.title.trim()) {
    errors.push('Exam title is required');
  }

  if (sections.length === 0) {
    errors.push('At least one section is required');
  }

  // Validation for published exams
  if (status === 'published') {
    const totalQuestions = calculateTotalQuestions(sections);
    if (totalQuestions === 0) {
      errors.push('Cannot publish exam without questions');
    }

    // Check if all sections have valid names
    const sectionsWithoutNames = sections.filter(section => !section.name.trim());
    if (sectionsWithoutNames.length > 0) {
      errors.push('All sections must have names');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Transform sections for API payload
 */
export const transformSectionsForAPI = (sections: ExamSection[]) => {
  return sections.map(section => ({
    id: section.id,
    name: section.name,
    description: section.description || '',
    timeLimit: section.timeLimit || 0,
    questions: (section.questions || []).map((question, index) => ({
      questionId: question.id,
      order: (question as Question & { order?: number }).order ?? index,
      marks: Number((question as Question & { marks?: number }).marks) || 1
    }))
  }));
};

/**
 * Generate default section
 */
export const createDefaultSection = (index: number): ExamSection => ({
  id: `section-${Date.now()}-${index}`,
  name: `Section ${index + 1}`,
  description: '',
  questions: [],
  timeLimit: 60,
  marks: 0,
  examId: '',
  questionsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/**
 * Format time in minutes to human readable format
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};

/**
 * Generate exam summary statistics
 */
export const generateExamSummary = (sections: ExamSection[]) => {
  const totalQuestions = calculateTotalQuestions(sections);
  const totalMarks = calculateTotalMarks(sections);
  const totalTime = calculateTotalTime(sections);
  
  // Calculate difficulty distribution
  const difficultyCount = { EASY: 0, MEDIUM: 0, HARD: 0 };
  sections.forEach(section => {
    section.questions?.forEach(question => {
      const difficulty = question.difficulty?.toUpperCase() as keyof typeof difficultyCount;
      if (difficulty in difficultyCount) {
        difficultyCount[difficulty]++;
      }
    });
  });

  // Calculate subject distribution
  const subjectCount: Record<string, number> = {};
  sections.forEach(section => {
    section.questions?.forEach(question => {
      const subject = question.subject;
      subjectCount[subject] = (subjectCount[subject] || 0) + 1;
    });
  });

  return {
    totalQuestions,
    totalMarks,
    totalTime: formatTime(totalTime),
    sectionsCount: sections.length,
    difficultyDistribution: difficultyCount,
    subjectDistribution: subjectCount,
    averageQuestionsPerSection: sections.length > 0 ? Math.round(totalQuestions / sections.length) : 0,
    averageMarksPerQuestion: totalQuestions > 0 ? Math.round(totalMarks / totalQuestions) : 0
  };
};
