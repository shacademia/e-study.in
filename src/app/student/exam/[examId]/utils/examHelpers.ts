import { Exam, ExamSection, QuestionAnswerStatus } from "@/constants/types";

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const getTimeColor = (timeLeft: number): string => {
  if (timeLeft <= 300) {
    // 5 minutes or less
    return "text-red-600 bg-red-50 border-red-200 animate-pulse";
  }
  if (timeLeft <= 600) {
    // 10 minutes or less
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
  const sectionQuestions = (section.questions ?? []).map((q) => q.id);
  const answered = sectionQuestions.filter(
    (qId) => questionStatuses[qId]?.status === "ANSWERED"
  ).length;
  return (answered / sectionQuestions.length) * 100;
};

export const getTotalQuestions = (exam: Exam | null): number => {
  if (!exam) return 0;
  
  // If exam has sections, count questions in all sections
  if (exam.sections && exam.sections.length > 0) {
    return exam.sections.reduce((total, section) => {
      return total + (section.questions?.length || 0);
    }, 0);
  }
  
  // Otherwise count direct questions
  return exam.questions?.length || 0;
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

export const calculateScore = (
  exam: Exam | null,
  answers: Record<string, number>
): number => {
  if (!exam) return 0;
  
  let score = 0;
  
  // Calculate score for questions in sections
  if (exam.sections && exam.sections.length > 0) {
    exam.sections.forEach(section => {
      if (section.questions && section.questions.length > 0) {
        section.questions.forEach(question => {
          if (answers[question.id] === question.correctOption) {
            score += 1;
          }
        });
      }
    });
  } 
  // Or calculate score for direct questions
  else if (exam.questions && exam.questions.length > 0) {
    exam.questions.forEach(question => {
      if (answers[question.id] === question.correctOption) {
        score += 1;
      }
    });
  }
  
  return score;
};

export const initializeQuestionStatuses = (exam: Exam): Record<string, QuestionAnswerStatus> => {
  const initialStatuses: Record<string, QuestionAnswerStatus> = {};
  
  // Handle questions from sections if they exist
  if (exam.sections && exam.sections.length > 0) {
    exam.sections.forEach(section => {
      if (section.questions && section.questions.length > 0) {
        section.questions.forEach(q => {
          initialStatuses[q.id] = {
            status: "NOT_ANSWERED",
            timeSpent: 0,
          };
        });
      }
    });
  } 
  // Handle direct questions if they exist
  else if (exam.questions) {
    exam.questions.forEach((q) => {
      initialStatuses[q.id] = {
        status: "NOT_ANSWERED",
        timeSpent: 0,
      };
    });
  }
  
  return initialStatuses;
};
