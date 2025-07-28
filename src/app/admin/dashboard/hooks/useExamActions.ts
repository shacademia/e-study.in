'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Exam } from '@/constants/types';
import { AdminStats, ExamFilter } from '../types';

interface UseExamActionsProps {
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  adminStats: AdminStats | null;
  setAdminStats: React.Dispatch<React.SetStateAction<AdminStats | null>>;
  examFilter: ExamFilter;
  fetchExamsByFilter: (filter: ExamFilter) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  examsApi: any; // You can type this more specifically based on your API
}

export const useExamActions = ({
  exams,
  setExams,
  adminStats,
  setAdminStats,
  examFilter,
  fetchExamsByFilter,
  examsApi,
}: UseExamActionsProps) => {
  const [recentlyDeletedExam, setRecentlyDeletedExam] = useState<Exam | null>(null);
  const [publishingExamId, setPublishingExamId] = useState<string | null>(null);
  const [deletingAllExams, setDeletingAllExams] = useState(false);

  const handleTogglePublish = async (examId: string, isPublished: boolean) => {
    const originalExam = exams.find(exam => exam.id === examId);
    if (!originalExam) return;

    try {
      setPublishingExamId(examId);

      // Optimistically update the UI
      setExams(prevExams => prevExams.map((exam) =>
        exam.id === examId 
          ? { 
              ...exam, 
              isPublished, 
              isDraft: !isPublished,
              updatedAt: new Date().toISOString()
            } 
          : exam
      ));

      // Optimistically update dashboard stats
      setAdminStats(prevStats => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          publishedExams: isPublished ? prevStats.publishedExams + 1 : Math.max(0, prevStats.publishedExams - 1),
          draftExams: isPublished ? Math.max(0, prevStats.draftExams - 1) : prevStats.draftExams + 1
        };
      });

      console.log(`🔄 ${isPublished ? 'Publishing' : 'Unpublishing'} exam:`, examId);
      const updatedExam = await examsApi.publishExam(examId, { isPublished });
      console.log('✅ Publish API response:', updatedExam);

      // Update with actual response from server
      setExams(prevExams => prevExams.map((exam) =>
        exam.id === examId ? { ...exam, ...(typeof updatedExam === 'object' && updatedExam !== null ? updatedExam : {}) } : exam
      ));

      // Refresh the exam data
      await fetchExamsByFilter(examFilter);

      toast({
        title: 'Success',
        description: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error("Failed to update exam:", error);
      
      // Revert the optimistic update
      setExams(prevExams => prevExams.map((exam) =>
        exam.id === examId ? originalExam : exam
      ));

      // Revert dashboard stats
      setAdminStats(prevStats => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          publishedExams: isPublished ? Math.max(0, prevStats.publishedExams - 1) : prevStats.publishedExams + 1,
          draftExams: isPublished ? prevStats.draftExams + 1 : Math.max(0, prevStats.draftExams - 1)
        };
      });

      // Show specific error message
      let errorMessage = `Failed to ${isPublished ? 'publish' : 'unpublish'} exam. Please try again.`;
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response?.data;
          if (errorData?.error === 'Cannot publish exam without questions') {
            errorMessage = 'Cannot publish exam without questions. Please add questions to the exam first.';
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'You do not have permission to publish/unpublish this exam.';
        } else if (axiosError.response?.status === 404) {
          errorMessage = 'Exam not found. It may have been deleted.';
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setPublishingExamId(null);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const examToDelete = exams.find(exam => exam.id === examId);
    if (!examToDelete) return;

    try {
      // Remove from UI optimistically
      setExams(exams.filter(exam => exam.id !== examId));
      setRecentlyDeletedExam(examToDelete);

      // Use real API to delete exam
      await examsApi.deleteExam(examId);

      toast({
        title: 'Success',
        description: 'Exam deleted successfully. You can undo this action within 10 seconds.',
      });

      // Clear undo option after 10 seconds
      setTimeout(() => setRecentlyDeletedExam(null), 10000);
    } catch (error) {
      console.error("Failed to delete exam:", error);
      // Revert on error
      setExams([...exams]);
      setRecentlyDeletedExam(null);
      toast({
        title: 'Error',
        description: 'Failed to delete exam',
        variant: 'destructive'
      });
    }
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeletedExam) return;

    try {
      // Add it back to the UI
      setExams([recentlyDeletedExam, ...exams]);
      setRecentlyDeletedExam(null);

      toast({
        title: 'Success',
        description: 'Exam restored successfully'
      });
    } catch (error) {
      console.error("Failed to restore exam:", error);
      toast({
        title: 'Error',
        description: 'Failed to restore exam',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveAllExams = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${exams.length} exams? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingAllExams(true);
      console.log(`🔄 Deleting all ${exams.length} exams...`);

      const originalExams = [...exams];
      setExams([]);

      const deletePromises = originalExams.map(async (exam) => {
        try {
          await examsApi.deleteExam(exam.id);
          return { success: true, examId: exam.id };
        } catch (error) {
          console.error(`Failed to delete exam ${exam.id}:`, error);
          return { success: false, examId: exam.id, error };
        }
      });

      const results = await Promise.all(deletePromises);
      const failures = results.filter(result => !result.success);

      if (failures.length > 0) {
        console.error(`❌ Failed to delete ${failures.length} exams`);
        const failedExamIds = failures.map(failure => failure.examId);
        const survivingExams = originalExams.filter(exam => 
          failedExamIds.includes(exam.id)
        );
        
        setExams(survivingExams);
        
        toast({
          title: 'Partial Success',
          description: `Deleted ${originalExams.length - failures.length} out of ${originalExams.length} exams. ${failures.length} exams could not be deleted.`,
          variant: 'destructive'
        });
      } else {
        console.log('✅ All exams deleted successfully');
        toast({
          title: 'Success',
          description: `All ${originalExams.length} exams have been deleted successfully`
        });
      }

      await fetchExamsByFilter(examFilter);

    } catch (error) {
      console.error("Failed to delete all exams:", error);
      await fetchExamsByFilter(examFilter);
      
      toast({
        title: 'Error',
        description: 'Failed to delete all exams. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingAllExams(false);
    }
  };

  const handleDuplicateExam = async () => {
    try {
      toast({
        title: 'Coming Soon',
        description: 'Exam duplication feature will be available soon'
      });
    } catch (error) {
      console.error("Failed to duplicate exam:", error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate exam',
        variant: 'destructive'
      });
    }
  };

  return {
    publishingExamId,
    deletingAllExams,
    recentlyDeletedExam,
    handleTogglePublish,
    handleDeleteExam,
    handleUndoDelete,
    handleRemoveAllExams,
    handleDuplicateExam,
  };
};
