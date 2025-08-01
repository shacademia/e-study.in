import { Exam, ExamSection, Question, QuestionAnswerStatus } from "@/constants/types";

// ✅ NEW: A single helper to get all questions, avoiding repeated logic.
export const getAllQuestions = (exam: Exam | null): Question[] => {
  if (!exam) return [];

  if (exam.sections && exam.sections.length > 0) {
    return exam.sections.flatMap(section => section.questions || []);
  }
  
  return exam.questions || [];
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60); // Use Math.floor to handle potential decimals

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const getTimeColor = (timeLeft: number): string => {
  if (timeLeft <= 300) { // 5 minutes or less
    return "text-red-600 bg-red-50 border-red-200 animate-pulse";
  }
  if (timeLeft <= 600) { // 10 minutes or less
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
  return "text-green-600 bg-green-50 border-green-200";
};

export const getQuestionStatusColor = (
  questionId: string,
  questionStatuses: Record<string, QuestionAnswerStatus>
): string => {
  const status = questionStatuses[questionId]?.status;
  switch (status) {
    case "ANSWERED":
      return "bg-green-100 text-green-800 border-green-300";
    case "MARKED_FOR_REVIEW":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const getSectionProgress = (
  section: ExamSection,
  questionStatuses: Record<string, QuestionAnswerStatus>
): number => {
  const sectionQuestions = section.questions ?? [];
  // ✅ FIX: Avoid division by zero if a section has no questions.
  if (sectionQuestions.length === 0) {
    return 0;
  }
  const answered = sectionQuestions.filter(
    (q) => questionStatuses[q.id]?.status === "ANSWERED"
  ).length;
  return (answered / sectionQuestions.length) * 100;
};

// ✅ REFACTORED: Simplified using the new helper.
export const getTotalQuestions = (exam: Exam | null): number => {
  return getAllQuestions(exam).length;
};

export const getAnsweredCount = (questionStatuses: Record<string, QuestionAnswerStatus>): number => {
  return Object.values(questionStatuses).filter(
    (status) => status.status === "ANSWERED"
  ).length;
};

export const getMarkedForReviewCount = (questionStatuses: Record<string, QuestionAnswerStatus>): number => {
  return Object.values(questionStatuses).filter(
    (status) => status.status === "MARKED_FOR_REVIEW"
  ).length;
};

// ✅ CRITICAL FIX: Correctly calculates score based on positive/negative marks.
export const calculateScore = (
  exam: Exam | null,
  answers: Record<string, number>
): number => {
  if (!exam) return 0;
  
  const allQuestions = getAllQuestions(exam);
  let score = 0;

  for (const question of allQuestions) {
    const userAnswerIndex = answers[question.id];
    
    if (userAnswerIndex === undefined || userAnswerIndex === -1) {
      // Unanswered question, no change in score.
      continue;
    }
    
    if (userAnswerIndex === question.correctOption) {
      // Correct answer
      score += question.positiveMarks;
    } else {
      // Incorrect answer
      score -= question.negativeMarks;
    }
  }
  
  return score;
};

// ✅ REFACTORED: Simplified using the new helper.
export const initializeQuestionStatuses = (exam: Exam): Record<string, QuestionAnswerStatus> => {
  const allQuestions = getAllQuestions(exam);
  const initialStatuses: Record<string, QuestionAnswerStatus> = {};
  
  allQuestions.forEach((q) => {
    initialStatuses[q.id] = {
      status: "NOT_ANSWERED",
      timeSpent: 0,
    };
  });
  
  return initialStatuses;
};
