import { Exam, Question } from '@/constants/types';

/**
 * General utility functions for admin exam management
 */

/**
 * Get exam status display information
 */
export const getExamStatusInfo = (exam: Exam) => {
  if (exam.isPublished) {
    return {
      status: 'published',
      label: 'Published',
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'This exam is live and accessible to students'
    };
  } else if (exam.isDraft) {
    return {
      status: 'draft',
      label: 'Draft',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'This exam is saved but not yet published'
    };
  } else {
    return {
      status: 'unpublished',
      label: 'Unpublished',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'This exam is no longer published'
    };
  }
};

/**
 * Calculate exam complexity score based on various factors
 */
export const calculateExamComplexity = (exam: Exam): number => {
  let complexity = 0;
  
  // Base complexity from number of questions
  const totalQuestions = exam.questions?.length || 0;
  complexity += Math.min(totalQuestions * 0.1, 3); // Max 3 points for questions
  
  // Complexity from number of sections
  const totalSections = exam.sections?.length || 0;
  complexity += Math.min(totalSections * 0.2, 2); // Max 2 points for sections
  
  // Complexity from difficulty distribution
  if (exam.questions) {
    const hardQuestions = exam.questions.filter(q => q.difficulty === 'HARD').length;
    complexity += Math.min((hardQuestions / totalQuestions) * 3, 3); // Max 3 points for difficulty
  }
  
  // Complexity from time limit
  const timeLimit = exam.timeLimit || 0;
  if (timeLimit > 180) complexity += 1; // Bonus for long exams
  if (timeLimit < 30) complexity += 0.5; // Bonus for short, focused exams
  
  return Math.min(complexity, 10); // Cap at 10
};

/**
 * Get exam difficulty level based on questions
 */
export const getExamDifficultyLevel = (exam: Exam): 'Easy' | 'Medium' | 'Hard' | 'Mixed' => {
  if (!exam.questions || exam.questions.length === 0) return 'Easy';
  
  const difficultyCount = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0
  };
  
  exam.questions.forEach(question => {
    const difficulty = question.difficulty?.toUpperCase() as keyof typeof difficultyCount;
    if (difficulty in difficultyCount) {
      difficultyCount[difficulty]++;
    }
  });
  
  const total = exam.questions.length;
  const easyPercent = (difficultyCount.EASY / total) * 100;
  const mediumPercent = (difficultyCount.MEDIUM / total) * 100;
  const hardPercent = (difficultyCount.HARD / total) * 100;
  
  // If any difficulty dominates (>70%), return that
  if (easyPercent > 70) return 'Easy';
  if (mediumPercent > 70) return 'Medium';
  if (hardPercent > 70) return 'Hard';
  
  return 'Mixed';
};

/**
 * Validate exam for publishing
 */
export const validateExamForPublishing = (exam: Partial<Exam>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!exam.name?.trim()) {
    errors.push('Exam name is required');
  }
  
  if (!exam.timeLimit || exam.timeLimit <= 0) {
    errors.push('Time limit must be greater than 0');
  }
  
  // Questions validation
  const totalQuestions = exam.questions?.length || 0;
  if (totalQuestions === 0) {
    errors.push('Exam must have at least one question');
  }
  
  // Sections validation
  if (exam.sections && exam.sections.length > 0) {
    exam.sections.forEach((section, index) => {
      if (!section.name?.trim()) {
        errors.push(`Section ${index + 1} must have a name`);
      }
      
      if (!section.questions || section.questions.length === 0) {
        warnings.push(`Section "${section.name}" has no questions`);
      }
    });
  }
  
  // Password validation
  if (exam.isPasswordProtected && !exam.password?.trim()) {
    errors.push('Password is required when password protection is enabled');
  }
  
  // Warnings for best practices
  if (totalQuestions < 5) {
    warnings.push('Consider adding more questions for a comprehensive assessment');
  }
  
  if (!exam.description?.trim()) {
    warnings.push('Adding a description helps students understand the exam purpose');
  }
  
  if (!exam.instructions?.trim()) {
    warnings.push('Adding instructions helps students prepare for the exam');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Generate exam preview URL
 */
export const generateExamPreviewUrl = (examId: string): string => {
  return `/student/exam/${examId}?preview=true`;
};

/**
 * Export exam data for backup or transfer
 */
export const exportExamData = (exam: Exam) => {
  const exportData = {
    ...exam,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `exam-${exam.name}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculate estimated completion time based on questions
 */
export const calculateEstimatedCompletionTime = (questions: Question[]): number => {
  let totalTime = 0;
  
  questions.forEach(question => {
    // Base time per question
    let questionTime = 1; // 1 minute base
    
    // Adjust based on difficulty
    switch (question.difficulty?.toUpperCase()) {
      case 'EASY':
        questionTime = 0.5;
        break;
      case 'MEDIUM':
        questionTime = 1.5;
        break;
      case 'HARD':
        questionTime = 3;
        break;
    }
    
    // Adjust based on content length
    const contentLength = question.content.length;
    if (contentLength > 200) questionTime += 0.5;
    if (contentLength > 500) questionTime += 1;
    
    // Adjust based on number of options
    const optionsCount = question.options.length;
    if (optionsCount > 4) questionTime += 0.2;
    if (optionsCount > 6) questionTime += 0.3;
    
    totalTime += questionTime;
  });
  
  // Add buffer time (20% extra)
  totalTime *= 1.2;
  
  return Math.ceil(totalTime);
};

/**
 * Generate exam analytics summary
 */
export const generateExamAnalytics = (exam: Exam) => {
  const questions = exam.questions || [];
  const sections = exam.sections || [];
  
  // Basic stats
  const totalQuestions = questions.length;
  const totalMarks = exam.totalMarks || 0;
  const timeLimit = exam.timeLimit || 0;
  
  // Difficulty distribution
  const difficultyStats = {
    EASY: questions.filter(q => q.difficulty === 'EASY').length,
    MEDIUM: questions.filter(q => q.difficulty === 'MEDIUM').length,
    HARD: questions.filter(q => q.difficulty === 'HARD').length
  };
  
  // Subject distribution
  const subjectStats: Record<string, number> = {};
  questions.forEach(question => {
    subjectStats[question.subject] = (subjectStats[question.subject] || 0) + 1;
  });
  
  // Topic distribution
  const topicStats: Record<string, number> = {};
  questions.forEach(question => {
    topicStats[question.topic] = (topicStats[question.topic] || 0) + 1;
  });
  
  // Time analysis
  const estimatedTime = calculateEstimatedCompletionTime(questions);
  const timeUtilization = timeLimit > 0 ? (estimatedTime / timeLimit) * 100 : 0;
  
  return {
    basic: {
      totalQuestions,
      totalMarks,
      timeLimit,
      sectionsCount: sections.length,
      averageMarksPerQuestion: totalQuestions > 0 ? totalMarks / totalQuestions : 0
    },
    difficulty: difficultyStats,
    subjects: subjectStats,
    topics: topicStats,
    time: {
      allocated: timeLimit,
      estimated: estimatedTime,
      utilization: Math.round(timeUtilization),
      recommendation: timeUtilization > 120 ? 'increase_time' : 
                     timeUtilization < 80 ? 'decrease_time' : 'optimal'
    },
    complexity: calculateExamComplexity(exam),
    overallDifficulty: getExamDifficultyLevel(exam)
  };
};
