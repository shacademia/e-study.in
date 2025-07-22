'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useExams, useQuestions } from '@/hooks/useApiServices';
import { 
  Question, 
  Exam, 
  CreateExamRequest
} from '@/constants/types';
import { toast } from '@/hooks/use-toast';

// Query keys
const examKeys = {
  all: ['exams'] as const,
  byId: (id: string) => [...examKeys.all, id] as const,
  forEdit: (id: string) => [...examKeys.all, 'edit', id] as const,
};

const questionKeys = {
  all: ['questions'] as const,
};

// Type for the exam editing payload
interface SaveExamWithSectionsPayload {
  exam: {
    name: string;
    description?: string;
    timeLimit: number;
    isPasswordProtected?: boolean;
    password?: string;
    instructions?: string;
    isPublished?: boolean;
    isDraft?: boolean;
  };
  sections: {
    id: string;
    name: string;
    description?: string;
    timeLimit?: number;
    questions: {
      questionId: string;
      order: number;
      marks: number;
    }[];
  }[];
}

// API Result type for exam editing (matches the actual service return type)
interface ExamEditResult {
  exam: Exam;
  sections: Array<{
    id: string;
    name: string;
    description?: string;
    timeLimit?: number;
    marks?: number;
    questionsCount: number;
    questions: Array<{
      id: string;
      questionId: string;
      order: number;
      marks: number;
      question: Question;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Custom hooks for exams
export function useExamQueries() {
  const examsApi = useExams();
  const queryClient = useQueryClient();

  // Get a specific exam for editing (with all sections and questions)
  const useExamForEdit = (examId?: string) => {
    return useQuery({
      queryKey: examId ? examKeys.forEdit(examId) : examKeys.all,
      queryFn: async () => {
        if (!examId) return null;
        const result = await examsApi.getExamForEdit(examId);
        return result as ExamEditResult;
      },
      enabled: !!examId, // Only run if examId is provided
    });
  };

  // Create a new exam
  const useCreateExam = () => {
    return useMutation<Exam, Error, CreateExamRequest>({
      mutationFn: async (examData: CreateExamRequest) => {
        const result = await examsApi.createExam(examData);
        return result as Exam;
      },
      onSuccess: () => {
        // Invalidate the exam list
        queryClient.invalidateQueries({ queryKey: examKeys.all });
        toast({
          title: 'Success',
          description: 'Exam created successfully'
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create exam',
          variant: 'destructive'
        });
      }
    });
  };

  // Save exam with sections
  const useSaveExamWithSections = () => {
    return useMutation({
      mutationFn: ({ examId, payload }: { examId: string; payload: SaveExamWithSectionsPayload }) => 
        examsApi.saveExamWithSections(examId, payload),
      onSuccess: (_, variables) => {
        // Invalidate specific exam queries
        queryClient.invalidateQueries({ queryKey: examKeys.byId(variables.examId) });
        queryClient.invalidateQueries({ queryKey: examKeys.forEdit(variables.examId) });
        toast({
          title: 'Success',
          description: 'Exam saved successfully'
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save exam',
          variant: 'destructive'
        });
      }
    });
  };

  return {
    useExamForEdit,
    useCreateExam,
    useSaveExamWithSections,
  };
}

// Custom hooks for questions
export function useQuestionQueries() {
  const questionsApi = useQuestions();

  // Get all questions
  const useAllQuestions = () => {
    return useQuery({
      queryKey: questionKeys.all,
      queryFn: async () => {
        const result = await questionsApi.getAllQuestions();
        // Handle API response structure
        if (result && typeof result === 'object' && 'data' in result) {
          const questionData = result as { data: { questions: Question[] } };
          return questionData.data?.questions || [];
        }
        return [];
      },
    });
  };

  return {
    useAllQuestions,
  };
}
