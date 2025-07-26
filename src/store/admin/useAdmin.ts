/**
 * ✅ SIMPLIFIED MASTER ADMIN HOOK - ZERO ERRORS
 * 
 * This is a simplified version that works with the current admin system.
 * Use this while the full version is being fixed.
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminActions,
  useAdminStats,
  useAdminExams,
  useAdminQuestions,
  useAdminUsers,
  useExamFilter,
  useUserFilter,
  useQuestionFilter,
  useActiveTab,
  useAdminLoading,
  useAdminErrors,
  useSelectedExams,
  useSelectedQuestions,
  useSelectedUsers,
  useExamPagination,
  useQuestionPagination,
  useUserPagination,
  useFilteredExams,
  useFilteredQuestions,
  useFilteredUsers,
} from './selectors';
import {
  useAdminStatsQuery,
  useAdminExamsQuery,
  useAdminQuestionsQuery,
  useAdminUsersQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useCreateQuestionMutation,
  useUpdateUserRoleMutation,
  useInvalidateAdminQueries,
} from './adminQueries';

/**
 * Master hook for admin functionality
 * Combines Zustand state management with TanStack Query caching
 */
export const useAdmin = () => {
  const queryClient = useQueryClient();
  
  // Zustand state
  const stats = useAdminStats();
  const exams = useAdminExams();
  const questions = useAdminQuestions();
  const users = useAdminUsers();
  
  // Filters
  const examFilter = useExamFilter();
  const userFilter = useUserFilter();
  const questionFilter = useQuestionFilter();
  
  // UI state
  const activeTab = useActiveTab();
  const loading = useAdminLoading();
  const errors = useAdminErrors();
  
  // Selection state
  const selectedExams = useSelectedExams();
  const selectedQuestions = useSelectedQuestions();
  const selectedUsers = useSelectedUsers();
  
  // Pagination
  const examPagination = useExamPagination();
  const questionPagination = useQuestionPagination();
  const userPagination = useUserPagination();
  
  // Filtered data
  const filteredExams = useFilteredExams();
  const filteredQuestions = useFilteredQuestions();
  const filteredUsers = useFilteredUsers();
  
  // Actions
  const actions = useAdminActions();
  const invalidateQueries = useInvalidateAdminQueries();
  
  // TanStack Query hooks with correct parameter order
  const statsQuery = useAdminStatsQuery({
    enabled: activeTab === 'dashboard',
  });
  
  const examsQuery = useAdminExamsQuery(
    examPagination.page,
    examPagination.limit,
    examFilter,
    {
      enabled: activeTab === 'dashboard' || activeTab === 'exams',
    }
  );
  
  const questionsQuery = useAdminQuestionsQuery(
    questionPagination.page,
    questionPagination.limit,
    questionFilter,
    {
      enabled: activeTab === 'questions',
    }
  );
  
  const usersQuery = useAdminUsersQuery(
    userPagination.page,
    userPagination.limit,
    userFilter,
    {
      enabled: activeTab === 'users',
    }
  );
  
  // Mutations
  const createExamMutation = useCreateExamMutation();
  const updateExamMutation = useUpdateExamMutation();
  const deleteExamMutation = useDeleteExamMutation();
  const createQuestionMutation = useCreateQuestionMutation();
  const updateUserMutation = useUpdateUserRoleMutation();
  
  // Enhanced actions
  const goToTab = useCallback((tab: typeof activeTab) => {
    actions.setActiveTab(tab);
  }, [actions]);
  
  const refreshData = useCallback(() => {
    invalidateQueries();
  }, [invalidateQueries]);
  
  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);
  
  return {
    // State
    state: {
      stats,
      exams,
      questions,
      users,
      filteredExams,
      filteredQuestions,
      filteredUsers,
      examFilter,
      userFilter,
      questionFilter,
      activeTab,
      loading,
      errors,
      selectedExams,
      selectedQuestions,
      selectedUsers,
      examPagination,
      questionPagination,
      userPagination,
    },
    
    // Queries
    queries: {
      stats: statsQuery,
      exams: examsQuery,
      questions: questionsQuery,
      users: usersQuery,
    },
    
    // Mutations
    mutations: {
      createExam: createExamMutation,
      updateExam: updateExamMutation,
      deleteExam: deleteExamMutation,
      createQuestion: createQuestionMutation,
      updateUser: updateUserMutation,
    },
    
    // Actions
    actions: {
      ...actions,
      goToTab,
      refreshData,
      clearCache,
    },
    
    // Computed values
    computed: {
      hasAnyLoading: Object.values(loading).some(Boolean),
      hasAnyError: Object.keys(errors).length > 0,
      hasAnySelection: selectedExams.size > 0 || selectedQuestions.size > 0 || selectedUsers.size > 0,
      selectedCount: selectedExams.size + selectedQuestions.size + selectedUsers.size,
      isDataStale: statsQuery.isStale || examsQuery.isStale || questionsQuery.isStale || usersQuery.isStale,
    },
  };
};

// Convenience hooks for specific sections
export const useAdminDashboard = () => {
  const admin = useAdmin();
  return {
    stats: admin.state.stats,
    loading: admin.state.loading.dashboard,
    error: admin.state.errors.dashboard,
    query: admin.queries.stats,
    actions: {
      refresh: admin.actions.refreshData,
      goToTab: admin.actions.goToTab,
    },
  };
};

export const useAdminExamsManager = () => {
  const admin = useAdmin();
  return {
    exams: admin.state.filteredExams,
    filter: admin.state.examFilter,
    pagination: admin.state.examPagination,
    selectedExams: admin.state.selectedExams,
    loading: admin.state.loading.exams,
    error: admin.state.errors.exams,
    query: admin.queries.exams,
    mutations: {
      create: admin.mutations.createExam,
      update: admin.mutations.updateExam,
      delete: admin.mutations.deleteExam,
    },
    actions: {
      setFilter: admin.actions.setExamFilter,
      setPagination: admin.actions.setExamPagination,
      toggleSelection: admin.actions.toggleExamSelection,
      selectAll: admin.actions.selectAllExams,
      clearSelection: admin.actions.clearAllSelections,
      openModal: admin.actions.openModal,
      closeModal: admin.actions.closeModal,
    },
  };
};

export const useAdminQuestionsManager = () => {
  const admin = useAdmin();
  return {
    questions: admin.state.filteredQuestions,
    filter: admin.state.questionFilter,
    pagination: admin.state.questionPagination,
    selectedQuestions: admin.state.selectedQuestions,
    loading: admin.state.loading.questions,
    error: admin.state.errors.questions,
    query: admin.queries.questions,
    mutations: {
      create: admin.mutations.createQuestion,
    },
    actions: {
      setFilter: admin.actions.setQuestionFilter,
      setPagination: admin.actions.setQuestionPagination,
      toggleSelection: admin.actions.toggleQuestionSelection,
      selectAll: admin.actions.selectAllQuestions,
      clearSelection: admin.actions.clearAllSelections,
      openModal: admin.actions.openModal,
      closeModal: admin.actions.closeModal,
    },
  };
};

export const useAdminUsersManager = () => {
  const admin = useAdmin();
  return {
    users: admin.state.filteredUsers,
    filter: admin.state.userFilter,
    pagination: admin.state.userPagination,
    selectedUsers: admin.state.selectedUsers,
    loading: admin.state.loading.users,
    error: admin.state.errors.users,
    query: admin.queries.users,
    mutation: admin.mutations.updateUser,
    actions: {
      setFilter: admin.actions.setUserFilter,
      setPagination: admin.actions.setUserPagination,
      toggleSelection: admin.actions.toggleUserSelection,
      selectAll: admin.actions.selectAllUsers,
      clearSelection: admin.actions.clearAllSelections,
    },
  };
};
