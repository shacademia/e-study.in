import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getExams,
  getExam,
  createExam,
  updateExam,
  getSections,
  createSubmission,
  getUserSubmissions,
  getExamSubmissions,
  getRankings,
  getUserRank,
  calculateRankings
} from '@/services/supabase/database';
import { useToast } from '@/hooks/use-toast';

type Exam = { id: string; [key: string]: unknown };
type Submission = { id: string; exam_id: string; [key: string]: unknown };
type UpdatePayload = Record<string, unknown>;
type MutationError = unknown;

// Questions hooks
export const useQuestions = (sectionId?: string) => {
  return useQuery({
    queryKey: ['questions', sectionId],
    queryFn: () => getQuestions(sectionId)
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestion(id),
    enabled: !!id
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question created successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to create question',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePayload }) =>
      updateQuestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question updated successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to update question',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({ title: 'Question deleted successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to delete question',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

// Exams hooks
export const useExams = (publishedOnly = false) => {
  return useQuery({
    queryKey: ['exams', publishedOnly],
    queryFn: () => getExams(publishedOnly)
  });
};

export const useExam = (id: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => getExam(id),
    enabled: !!id
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam created successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to create exam',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePayload }) =>
      updateExam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam updated successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to update exam',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

// Sections hooks
export const useSections = (examId: string) => {
  return useQuery({
    queryKey: ['sections', examId],
    queryFn: () => getSections(examId),
    enabled: !!examId
  });
};

// Submissions hooks
export const useUserSubmissions = (userId: string) => {
  return useQuery({
    queryKey: ['user-submissions', userId],
    queryFn: () => getUserSubmissions(userId),
    enabled: !!userId
  });
};

export const useExamSubmissions = (examId: string) => {
  return useQuery({
    queryKey: ['exam-submissions', examId],
    queryFn: () => getExamSubmissions(examId),
    enabled: !!examId
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createSubmission,
    onSuccess: async (data: Submission) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });

      try {
        await calculateRankings(data.exam_id);
        queryClient.invalidateQueries({ queryKey: ['rankings'] });
      } catch (error) {
        console.error('Failed to calculate rankings:', error);
      }

      toast({ title: 'Exam submitted successfully' });
    },
    onError: (error: MutationError) => {
      toast({
        title: 'Failed to submit exam',
        description: (error as Error).message,
        variant: 'destructive'
      });
    }
  });
};

// Rankings hooks
export const useRankings = (examId: string) => {
  return useQuery({
    queryKey: ['rankings', examId],
    queryFn: () => getRankings(examId),
    enabled: !!examId
  });
};

export const useUserRank = (userId: string, examId: string) => {
  return useQuery({
    queryKey: ['user-rank', userId, examId],
    queryFn: () => getUserRank(userId, examId),
    enabled: !!(userId && examId)
  });
};

// Real-time hooks using Supabase subscriptions
export const useExamRealtime = (examId: string) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!examId) return;

    import('@/config/supabase').then(({ supabase }) => {
      const examSubscription = supabase
        .channel(`exam-${examId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'exams',
            filter: `id=eq.${examId}`
          },
          (payload) => {
            setExam(payload.new as Exam);
          }
        )
        .subscribe();

      const submissionsSubscription = supabase
        .channel(`submissions-${examId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'submissions',
            filter: `exam_id=eq.${examId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSubmissions((prev) => [...prev, payload.new as Submission]);
            }
          }
        )
        .subscribe();

      return () => {
        examSubscription.unsubscribe();
        submissionsSubscription.unsubscribe();
      };
    });
  }, [examId]);

  return { exam, submissions };
};
