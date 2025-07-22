import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { examService } from '@/services/exam';
import { ExamStore } from '../types';
import { isCacheValid, getCurrentTimestamp, safeAsync } from '../utils/cache';
import { toast } from '@/hooks/use-toast';

const initialState = {
  exams: [],
  currentExam: null,
  examForEdit: null,
  isLoading: false,
  error: null,
  lastFetch: null,
};

export const useExamStore = create<ExamStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Fetch all exams with caching
        fetchExams: async () => {
          const state = get();
          
          // Check if cache is valid
          if (isCacheValid(state.lastFetch) && state.exams.length > 0) {
            return;
          }

          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.getAllExams(),
            'Failed to fetch exams'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return;
          }

          if (data?.data?.exams) {
            set({
              exams: data.data.exams,
              isLoading: false,
              error: null,
              lastFetch: getCurrentTimestamp()
            });
          } else {
            set({
              isLoading: false,
              error: 'Invalid response format'
            });
          }
        },

        // Fetch exam for editing with caching
        fetchExamForEdit: async (examId: string) => {
          const state = get();
          
          // Check if we already have this exam loaded
          if (state.examForEdit?.exam?.id === examId && isCacheValid(state.lastFetch)) {
            return;
          }

          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.getExamForEdit(examId),
            'Failed to fetch exam for editing'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return;
          }

          if (data) {
            set({
              examForEdit: data,
              isLoading: false,
              error: null,
              lastFetch: getCurrentTimestamp()
            });
          } else {
            set({
              isLoading: false,
              error: 'Failed to load exam data'
            });
          }
        },

        // Create new exam
        createExam: async (examData) => {
          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.createExam(examData),
            'Failed to create exam'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return null;
          }

          if (data) {
            // Add to exams list and invalidate cache
            const state = get();
            set({
              exams: [data, ...state.exams],
              isLoading: false,
              error: null,
              lastFetch: null // Invalidate cache to force refresh
            });

            toast({
              title: 'Success',
              description: 'Exam created successfully'
            });

            return data;
          }

          set({ isLoading: false, error: 'Failed to create exam' });
          return null;
        },

        // Update exam
        updateExam: async (examId, examData) => {
          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.updateExam(examId, examData),
            'Failed to update exam'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return null;
          }

          if (data) {
            // Update exam in list
            const state = get();
            const updatedExams = state.exams.map(exam => 
              exam.id === examId ? data : exam
            );

            set({
              exams: updatedExams,
              currentExam: state.currentExam?.id === examId ? data : state.currentExam,
              isLoading: false,
              error: null
            });

            toast({
              title: 'Success',
              description: 'Exam updated successfully'
            });

            return data;
          }

          set({ isLoading: false, error: 'Failed to update exam' });
          return null;
        },

        // Delete exam
        deleteExam: async (examId) => {
          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.deleteExam(examId),
            'Failed to delete exam'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return false;
          }

          if (data) {
            // Remove from exams list
            const state = get();
            const filteredExams = state.exams.filter(exam => exam.id !== examId);

            set({
              exams: filteredExams,
              currentExam: state.currentExam?.id === examId ? null : state.currentExam,
              isLoading: false,
              error: null
            });

            toast({
              title: 'Success',
              description: 'Exam deleted successfully'
            });

            return true;
          }

          set({ isLoading: false, error: 'Failed to delete exam' });
          return false;
        },

        // Save exam with sections
        saveExamWithSections: async (examId, payload) => {
          set({ isLoading: true, error: null });

          const { data, error } = await safeAsync(
            () => examService.saveExamWithSections(examId, payload),
            'Failed to save exam with sections'
          );

          if (error) {
            set({ isLoading: false, error });
            toast({
              title: 'Error',
              description: error,
              variant: 'destructive'
            });
            return false;
          }

          if (data) {
            set((state) => {
              // Update the exams list with the new data
              const updatedExams = state.exams.map(exam => 
                exam.id === examId ? data : exam
              );
              
              // If this exam wasn't in the list, add it
              const examExists = state.exams.some(exam => exam.id === examId);
              if (!examExists) {
                updatedExams.push(data);
              }

              return {
                ...state,
                exams: updatedExams,
                currentExam: data,
                // Update examForEdit if it's the same exam - clear it to force fresh fetch
                examForEdit: state.examForEdit?.exam?.id === examId ? null : state.examForEdit,
                isLoading: false,
                error: null,
                lastFetch: null // Invalidate cache
              };
            });

            toast({
              title: 'Success',
              description: 'Exam saved successfully'
            });

            return true;
          }

          set({ isLoading: false, error: 'Failed to save exam' });
          return false;
        },

        // Set current exam
        setCurrentExam: (exam) => {
          set({ currentExam: exam });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Clear exam for edit data
        clearExamForEdit: () => {
          set((state) => ({
            ...state,
            examForEdit: null
          }));
        },

        // Reset store
        reset: () => {
          set(initialState);
        }
      }),
      {
        name: 'exam-store',
        partialize: (state) => ({
          exams: state.exams,
          lastFetch: state.lastFetch,
          currentExam: state.currentExam
        }),
        version: 1
      }
    ),
    { name: 'ExamStore' }
  )
);
