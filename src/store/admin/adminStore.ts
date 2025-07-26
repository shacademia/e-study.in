import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AdminStore, AdminStoreState } from './types';

// Initial state
const initialState: AdminStoreState = {
  // Data
  stats: null,
  metrics: null,
  exams: [],
  questions: [],
  users: [],
  
  // Filters
  examFilter: { status: 'all' },
  userFilter: { role: 'all' },
  questionFilter: {},
  
  // UI State
  activeTab: 'dashboard',
  sidebarCollapsed: false,
  modals: {
    createExam: false,
    editExam: false,
    deleteExam: false,
    createQuestion: false,
    editQuestion: false,
    deleteQuestion: false,
    bulkActions: false,
  },
  loading: {
    dashboard: false,
    exams: false,
    questions: false,
    users: false,
    analytics: false,
  },
  errors: {},
  
  // Selection
  selectedExams: new Set(),
  selectedQuestions: new Set(),
  selectedUsers: new Set(),
  bulkActionMode: false,
  
  // Pagination
  examPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  questionPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  userPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  
  // Recently modified
  recentlyModified: {
    exams: new Set(),
    questions: new Set(),
    users: new Set(),
  },
};

export const useAdminStore = create<AdminStore>()(
  subscribeWithSelector(
    immer((set) => ({
      ...initialState,
      
      // Data setters
      setStats: (stats) => set((state) => {
        state.stats = stats;
      }),
      
      setMetrics: (metrics) => set((state) => {
        state.metrics = metrics;
      }),
      
      setExams: (exams) => set((state) => {
        state.exams = exams;
        state.examPagination.total = exams.length;
      }),
      
      setQuestions: (questions) => set((state) => {
        state.questions = questions;
        state.questionPagination.total = questions.length;
      }),
      
      setUsers: (users) => set((state) => {
        state.users = users;
        state.userPagination.total = users.length;
      }),
      
      // Individual data operations
      addExam: (exam) => set((state) => {
        state.exams.push(exam);
        state.examPagination.total = state.exams.length;
      }),
      
      updateExam: (examId, updates) => set((state) => {
        const index = state.exams.findIndex(e => e.id === examId);
        if (index !== -1) {
          Object.assign(state.exams[index], updates);
        }
        state.recentlyModified.exams.add(examId);
      }),
      
      removeExam: (examId) => set((state) => {
        state.exams = state.exams.filter(e => e.id !== examId);
        state.examPagination.total = state.exams.length;
        state.selectedExams.delete(examId);
      }),
      
      addQuestion: (question) => set((state) => {
        state.questions.push(question);
        state.questionPagination.total = state.questions.length;
      }),
      
      updateQuestion: (questionId, updates) => set((state) => {
        const index = state.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
          Object.assign(state.questions[index], updates);
        }
        state.recentlyModified.questions.add(questionId);
      }),
      
      removeQuestion: (questionId) => set((state) => {
        state.questions = state.questions.filter(q => q.id !== questionId);
        state.questionPagination.total = state.questions.length;
        state.selectedQuestions.delete(questionId);
      }),
      
      updateUser: (userId, updates) => set((state) => {
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          Object.assign(state.users[index], updates);
        }
        state.recentlyModified.users.add(userId);
      }),
      
      // Filter setters
      setExamFilter: (filter) => set((state) => {
        state.examFilter = filter;
        state.examPagination.page = 1; // Reset to first page
      }),
      
      setUserFilter: (filter) => set((state) => {
        state.userFilter = filter;
        state.userPagination.page = 1; // Reset to first page
      }),
      
      setQuestionFilter: (filter) => set((state) => {
        state.questionFilter = filter;
        state.questionPagination.page = 1; // Reset to first page
      }),
      
      // Reset all filters
      resetFilters: () => set((state) => {
        state.examFilter = { status: 'all' };
        state.userFilter = { role: 'all' };
        state.questionFilter = {};
        state.examPagination.page = 1;
        state.questionPagination.page = 1;
        state.userPagination.page = 1;
      }),
      
      // UI actions
      setActiveTab: (tab) => set((state) => {
        state.activeTab = tab;
      }),
      
      toggleSidebar: () => set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      }),
      
      // Modal actions
      openModal: (modalName) => set((state) => {
        state.modals[modalName] = true;
      }),
      
      closeModal: (modalName) => set((state) => {
        state.modals[modalName] = false;
      }),
      
      // Loading actions
      setLoading: (section, isLoading) => set((state) => {
        state.loading[section] = isLoading;
      }),
      
      // Error actions
      setError: (section, error) => set((state) => {
        state.errors[section] = error;
      }),
      
      clearErrors: () => set((state) => {
        state.errors = {};
      }),
      
      // Selection actions
      toggleExamSelection: (examId) => set((state) => {
        if (state.selectedExams.has(examId)) {
          state.selectedExams.delete(examId);
        } else {
          state.selectedExams.add(examId);
        }
      }),
      
      toggleQuestionSelection: (questionId) => set((state) => {
        if (state.selectedQuestions.has(questionId)) {
          state.selectedQuestions.delete(questionId);
        } else {
          state.selectedQuestions.add(questionId);
        }
      }),
      
      toggleUserSelection: (userId) => set((state) => {
        if (state.selectedUsers.has(userId)) {
          state.selectedUsers.delete(userId);
        } else {
          state.selectedUsers.add(userId);
        }
      }),
      
      selectAllExams: () => set((state) => {
        state.exams.forEach(exam => state.selectedExams.add(exam.id));
      }),
      
      selectAllQuestions: () => set((state) => {
        state.questions.forEach(question => state.selectedQuestions.add(question.id));
      }),
      
      selectAllUsers: () => set((state) => {
        state.users.forEach(user => state.selectedUsers.add(user.id));
      }),
      
      clearAllSelections: () => set((state) => {
        state.selectedExams.clear();
        state.selectedQuestions.clear();
        state.selectedUsers.clear();
        state.bulkActionMode = false;
      }),
      
      setBulkActionMode: (enabled) => set((state) => {
        state.bulkActionMode = enabled;
        if (!enabled) {
          state.selectedExams.clear();
          state.selectedQuestions.clear();
          state.selectedUsers.clear();
        }
      }),
      
      // Pagination actions
      setExamPagination: (pagination) => set((state) => {
        Object.assign(state.examPagination, pagination);
      }),
      
      setQuestionPagination: (pagination) => set((state) => {
        Object.assign(state.questionPagination, pagination);
      }),
      
      setUserPagination: (pagination) => set((state) => {
        Object.assign(state.userPagination, pagination);
      }),
      
      // Utility actions
      markAsRecentlyModified: (type, id) => set((state) => {
        state.recentlyModified[type].add(id);
      }),
      
      refreshData: () => {
        // This would trigger re-fetching of data in a real implementation
        // For now, just clear recently modified
        set((state) => {
          state.recentlyModified.exams.clear();
          state.recentlyModified.questions.clear();
          state.recentlyModified.users.clear();
        });
      },
      
      reset: () => set(() => ({ ...initialState })),
    }))
  )
);
