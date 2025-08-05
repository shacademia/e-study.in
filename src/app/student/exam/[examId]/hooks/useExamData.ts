import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useApiAuth";
import { useExams, useSubmissions } from "@/hooks/useApiServices";
import { toast } from "@/hooks/use-toast";
import { useResult } from "@/context/ResultContext";
import { Exam, Question, ExamSection } from "@/constants/types";
import { 
  ExamTimerState, 
  ExamNavigationState, 
  ExamUIState, 
  ExamData 
} from "../types";
import { 
  initializeQuestionStatuses, 
  getTotalQuestions, 
  calculateScore 
} from "../utils/examHelpers";

// Types for the nested API response structure
interface ExamQuestionResponse {
  question: Question;
  order: number;
  marks: number;
}

interface ExamSectionResponse extends Omit<ExamSection, 'questions'> {
  questions: ExamQuestionResponse[];
}

interface QuestionStatus {
  timeSpent: number;
  isAnswered: boolean;
  isMarked: boolean;
  isVisited: boolean;
}

interface ExamStatistics {
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracy: number;
}

interface ExamSubmissionData {
  id: string;
  userId: string;
  examId: string;
  submissionId: string;
  score: number;
  timeSpent: number;
  totalQuestions: number;
  answers: Record<string, string>;
  questionStatuses: Record<string, QuestionStatus>;
  isSubmitted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  exam: Exam;
  statistics: ExamStatistics;
  questionAnalysis: Record<string, boolean>;
  subjectAnalysis: Record<string, ExamStatistics>;
  performance: {
    percentile: number;
    rank: number;
  };
}

interface ExamSubmissionResponse {
  success: boolean;
  message: string;
  data: ExamSubmissionData;
}

interface ExamApiResponse extends Omit<Exam, 'sections' | 'questions'> {
  sections?: ExamSectionResponse[];
  questions?: ExamQuestionResponse[];
}

export const useExamData = (examId: string) => {
  const router = useRouter();
  const { user } = useAuth();
  const { getExamById } = useExams();
  const { submitExam } = useSubmissions();
  const { setResultData } = useResult();

  // Timer state
  const [timerState, setTimerState] = useState<ExamTimerState>({
    timeLeft: 0,
    startTime: null,
    questionStartTime: null,
    examStarted: false,
  });

  // Navigation state
  const [navigationState, setNavigationState] = useState<ExamNavigationState>({
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    questionStatuses: {},
  });

  // UI state
  const [uiState, setUiState] = useState<ExamUIState>({
    loading: true,
    isOnBreak: false,
    showPasswordModal: false,
    showBreakModal: false,
    showSubmitDialog: false,
    password: "",
    passwordError: "",
    showPassword: false,
  });

  // Exam data
  const [exam, setExam] = useState<Exam | null>(null);

  // Get current question
  const getCurrentQuestion = useCallback((): Question | null => {
    if (!exam || !exam.sections || exam.sections.length === 0) {
      return exam?.questions?.[navigationState.currentQuestionIndex] || null;
    }

    const currentSection = exam.sections[navigationState.currentSectionIndex];
    return currentSection?.questions?.[navigationState.currentQuestionIndex] || null;
  }, [exam, navigationState.currentSectionIndex, navigationState.currentQuestionIndex]);

  // Get current section
  const getCurrentSection = useCallback((): ExamSection | null => {
    if (!exam || !exam.sections || exam.sections.length === 0) return null;
    return exam.sections[navigationState.currentSectionIndex] || null;
  }, [exam, navigationState.currentSectionIndex]);

  // Derived exam data - Calculate directly without useCallback dependencies
  const examData: ExamData = useMemo(() => {
    // Calculate current question directly
    let currentQuestion: Question | null = null;
    if (!exam || !exam.sections || exam.sections.length === 0) {
      currentQuestion = exam?.questions?.[navigationState.currentQuestionIndex] || null;
    } else {
      const currentSection = exam.sections[navigationState.currentSectionIndex];
      currentQuestion = currentSection?.questions?.[navigationState.currentQuestionIndex] || null;
    }

    // Calculate current section directly  
    let currentSection: ExamSection | null = null;
    if (exam && exam.sections && exam.sections.length > 0) {
      currentSection = exam.sections[navigationState.currentSectionIndex] || null;
    }

    const hasMultipleSections = exam?.sections && exam.sections.length > 0;
    const totalQuestions = getTotalQuestions(exam);

    return {
      exam,
      currentQuestion,
      currentSection,
      hasMultipleSections: !!hasMultipleSections,
      totalQuestions,
    };
  }, [exam, navigationState.currentSectionIndex, navigationState.currentQuestionIndex]);

  // Load exam data
  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;

      try {
        const examData = await getExamById(examId) as ExamApiResponse;
        console.log('Raw exam data loaded:', examData);

        if (examData) {
          // Transform the exam data to flatten the question structure
          const transformedExam: Exam = {
            ...examData,
            // Transform sections to flatten question structure
            sections: examData.sections?.map((section: ExamSectionResponse) => ({
              ...section,
              questions: section.questions?.map((examQuestion: ExamQuestionResponse) => examQuestion.question) || []
            })) || [],
            // Transform direct questions to flatten structure
            questions: examData.questions?.map((examQuestion: ExamQuestionResponse) => examQuestion.question) || []
          };

          console.log('Transformed exam data:', transformedExam);
          setExam(transformedExam);
          
          setTimerState(prev => ({
            ...prev,
            timeLeft: transformedExam.timeLimit * 60, // Convert minutes to seconds
          }));

          // Initialize question statuses
          const initialStatuses = initializeQuestionStatuses(transformedExam);
          setNavigationState(prev => ({
            ...prev,
            questionStatuses: initialStatuses,
          }));

          // Check if exam is password protected
          if (transformedExam.isPasswordProtected) {
            setUiState(prev => ({ ...prev, showPasswordModal: true }));
          } else {
            const now = new Date();
            setTimerState(prev => ({
              ...prev,
              examStarted: true,
              startTime: now,
              questionStartTime: now,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading exam:", error);
        toast({
          title: "Error",
          description: "Failed to load exam",
          variant: "destructive",
        });
      } finally {
        setUiState(prev => ({ ...prev, loading: false }));
      }
    };

    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]); // Only depend on examId to prevent infinite loop from getExamById

  // Update question time spent
  const updateQuestionTimeSpent = useCallback(() => {
    if (!timerState.questionStartTime) return;

    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      const timeSpent = Math.floor(
        (new Date().getTime() - timerState.questionStartTime.getTime()) / 1000
      );
      setNavigationState(prev => ({
        ...prev,
        questionStatuses: {
          ...prev.questionStatuses,
          [currentQuestion.id]: {
            ...prev.questionStatuses[currentQuestion.id],
            timeSpent: (prev.questionStatuses[currentQuestion.id]?.timeSpent || 0) + timeSpent,
          },
        },
      }));
    }
  }, [timerState.questionStartTime, getCurrentQuestion]);

  // Submit exam
  const handleSubmitExam = useCallback(async () => {
    if (!exam || !user) return;

    updateQuestionTimeSpent();

    try {
      const score = calculateScore(exam, navigationState.answers);
      const totalTimeSpent = timerState.startTime
        ? Math.floor((new Date().getTime() - timerState.startTime.getTime()) / 1000)
        : 0;

      const results = await submitExam(exam.id, {
        examId: exam.id,
        answers: navigationState.answers,
        questionStatuses: navigationState.questionStatuses,
        score,
        totalQuestions: getTotalQuestions(exam),
        timeSpent: totalTimeSpent,
        isSubmitted: true,
      }) as ExamSubmissionResponse;

      if (!results.success || !results.data?.submissionId) {
        toast({
          title: results.message || "Error",
          description: results.message || "Failed to submit exam. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const submissionId = results.data.submissionId;


      toast({ 
        title: "Exam Submitted", 
        description: `Your exam has been submitted successfully. Score: ${score}/${getTotalQuestions(exam)}`,
        variant: "default"
      });
      
      router.push(`/student/results/${submissionId}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: "Failed to submit exam",
        variant: "destructive",
      });
    }
  }, [
    exam,
    user,
    navigationState.answers,
    navigationState.questionStatuses,
    timerState.startTime,
    router,
    updateQuestionTimeSpent,
    submitExam,
  ]);

  return {
    // State
    timerState,
    navigationState,
    uiState,
    examData,
    
    // Actions
    setTimerState,
    setNavigationState,
    setUiState,
    updateQuestionTimeSpent,
    handleSubmitExam,
    
    // Derived values
    getCurrentQuestion,
    getCurrentSection,
  };
};
