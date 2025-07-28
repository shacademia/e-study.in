import { useState, useCallback } from 'react';
import { examService } from '@/services';
import { Exam, CreateExamRequest, UpdateExamRequest } from '@/constants/types';
import { useToast } from '@/hooks/use-toast';

interface UseExamManagementReturn {
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  publishing: boolean;
  createExam: (examData: CreateExamRequest) => Promise<Exam | null>;
  updateExam: (examId: string, updates: UpdateExamRequest) => Promise<Exam | null>;
  deleteExam: (examId: string) => Promise<boolean>;
  publishExam: (examId: string, isPublished: boolean) => Promise<boolean>;
  duplicateExam: (examId: string) => Promise<Exam | null>;
}

export const useExamManagement = (): UseExamManagementReturn => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const createExam = useCallback(async (examData: CreateExamRequest): Promise<Exam | null> => {
    setCreating(true);
    setLoading(true);
    
    try {
      const newExam = await examService.createExam(examData);
      
      toast({
        title: 'Success',
        description: 'Exam created successfully',
      });
      
      return newExam;
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to create exam',
        variant: 'destructive',
      });
      return null;
    } finally {
      setCreating(false);
      setLoading(false);
    }
  }, [toast]);

  const updateExam = useCallback(async (examId: string, updates: UpdateExamRequest): Promise<Exam | null> => {
    setUpdating(true);
    setLoading(true);
    
    try {
      const updatedExam = await examService.updateExam(examId, updates);
      
      toast({
        title: 'Success',
        description: 'Exam updated successfully',
      });
      
      return updatedExam;
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to update exam',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUpdating(false);
      setLoading(false);
    }
  }, [toast]);

  const deleteExam = useCallback(async (examId: string): Promise<boolean> => {
    setDeleting(true);
    setLoading(true);
    
    try {
      await examService.deleteExam(examId);
      
      toast({
        title: 'Success',
        description: 'Exam deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete exam',
        variant: 'destructive',
      });
      return false;
    } finally {
      setDeleting(false);
      setLoading(false);
    }
  }, [toast]);

  const publishExam = useCallback(async (examId: string, isPublished: boolean): Promise<boolean> => {
    setPublishing(true);
    setLoading(true);
    
    try {
      await examService.updateExam(examId, { isPublished });
      
      toast({
        title: 'Success',
        description: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating exam publish status:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isPublished ? 'publish' : 'unpublish'} exam`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setPublishing(false);
      setLoading(false);
    }
  }, [toast]);

  const duplicateExam = useCallback(async (examId: string): Promise<Exam | null> => {
    setLoading(true);
    
    try {
      // First get the exam details
      const originalExam = await examService.getExamById(examId);
      if (!originalExam) {
        throw new Error('Original exam not found');
      }

      // Create duplicate with modified name
      const duplicateData: CreateExamRequest = {
        name: `${originalExam.name} (Copy)`,
        description: originalExam.description || '',
        timeLimit: originalExam.timeLimit,
        isPasswordProtected: originalExam.isPasswordProtected,
        password: originalExam.password || '',
        instructions: originalExam.instructions || '',
      };

      const duplicatedExam = await examService.createExam(duplicateData);
      
      toast({
        title: 'Success',
        description: 'Exam duplicated successfully',
      });
      
      return duplicatedExam;
    } catch (error) {
      console.error('Error duplicating exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate exam',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    creating,
    updating,
    deleting,
    publishing,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    duplicateExam,
  };
};
