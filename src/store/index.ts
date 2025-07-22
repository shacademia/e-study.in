// Export all store slices
export { useExamStore } from './slices/examStore';
export { useQuestionStore } from './slices/questionStore';
export { useUIStore } from './slices/uiStore';

// Export types
export type * from './types';

// Export utilities
export * from './utils/cache';

// Store initialization hook
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useExamStore } from './slices/examStore';
import { useQuestionStore } from './slices/questionStore';
import { useUIStore } from './slices/uiStore';

/**
 * Hook to initialize stores with data fetching
 * Call this in your root component or layout
 */
export const useStoreInitialization = () => {
  const fetchExams = useExamStore(state => state.fetchExams);
  const fetchQuestions = useQuestionStore(state => state.fetchQuestions);

  useEffect(() => {
    // Initialize stores with cached data or fetch fresh data
    const initializeStores = async () => {
      try {
        await Promise.all([
          fetchExams(),
          fetchQuestions()
        ]);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };
    
    initializeStores();
  }, [fetchExams, fetchQuestions]); // Add dependencies but they should be stable
};

/**
 * Selective store hooks for better performance
 * Use these instead of accessing the full store when you only need specific data
 */

// Exam selectors
export const useExams = () => useExamStore(state => state.exams);
export const useExamsLoading = () => useExamStore(state => state.isLoading);
export const useExamsError = () => useExamStore(state => state.error);

export const useExamsData = () => useExamStore(
  useShallow(state => ({
    exams: state.exams,
    isLoading: state.isLoading,
    error: state.error
  }))
);

export const useCurrentExam = () => useExamStore(state => state.currentExam);

export const useExamForEdit = () => useExamStore(state => state.examForEdit);

export const useExamForEditData = () => useExamStore(
  useShallow(state => ({
    examForEdit: state.examForEdit,
    isLoading: state.isLoading,
    error: state.error
  }))
);

export const useExamActions = () => useExamStore(
  useShallow(state => ({
    fetchExams: state.fetchExams,
    fetchExamForEdit: state.fetchExamForEdit,
    createExam: state.createExam,
    updateExam: state.updateExam,
    deleteExam: state.deleteExam,
    saveExamWithSections: state.saveExamWithSections,
    setCurrentExam: state.setCurrentExam,
    clearExamForEdit: state.clearExamForEdit,
    clearError: state.clearError
  }))
);

// Question selectors
export const useQuestions = () => useQuestionStore(state => state.questions);
export const useFilteredQuestions = () => useQuestionStore(state => state.filteredQuestions);
export const useQuestionsLoading = () => useQuestionStore(state => state.isLoading);
export const useQuestionsError = () => useQuestionStore(state => state.error);

export const useQuestionsData = () => useQuestionStore(
  useShallow(state => ({
    questions: state.questions,
    filteredQuestions: state.filteredQuestions,
    isLoading: state.isLoading,
    error: state.error
  }))
);

export const useQuestionFilters = () => useQuestionStore(
  useShallow(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters
  }))
);

export const useQuestionActions = () => useQuestionStore(
  useShallow(state => ({
    fetchQuestions: state.fetchQuestions,
    createQuestion: state.createQuestion,
    updateQuestion: state.updateQuestion,
    deleteQuestion: state.deleteQuestion,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    clearError: state.clearError
  }))
);

// UI selectors
export const useExamBuilderUI = () => useUIStore(
  useShallow(state => ({
    activeSection: state.examBuilder.activeSection,
    selectedQuestions: state.examBuilder.selectedQuestions,
    showQuestionSelector: state.examBuilder.showQuestionSelector,
    setActiveSection: state.setActiveSection,
    toggleQuestionSelection: state.toggleQuestionSelection,
    clearSelectedQuestions: state.clearSelectedQuestions,
    setShowQuestionSelector: state.setShowQuestionSelector
  }))
);

export const useNotifications = () => useUIStore(state => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}));

export const useModals = () => useUIStore(state => ({
  modals: state.modals,
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals
}));
