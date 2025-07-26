import { useAdminStore } from './adminStore';

// Data selectors
export const useAdminStats = () => useAdminStore(state => state.stats);

export const useAdminMetrics = () => useAdminStore(state => state.metrics);

export const useAdminExams = () => useAdminStore(state => state.exams);

export const useAdminQuestions = () => useAdminStore(state => state.questions);

export const useAdminUsers = () => useAdminStore(state => state.users);

// Filter selectors
export const useExamFilter = () => useAdminStore(state => state.examFilter);

export const useUserFilter = () => useAdminStore(state => state.userFilter);

export const useQuestionFilter = () => useAdminStore(state => state.questionFilter);

// UI selectors
export const useActiveTab = () => useAdminStore(state => state.activeTab);

export const useAdminLoading = () => useAdminStore(state => state.loading);

export const useAdminErrors = () => useAdminStore(state => state.errors);

export const useSelectedExams = () => useAdminStore(state => state.selectedExams);

export const useSelectedQuestions = () => useAdminStore(state => state.selectedQuestions);

export const useSelectedUsers = () => useAdminStore(state => state.selectedUsers);

export const useBulkActionMode = () => useAdminStore(state => state.bulkActionMode);

// Pagination selectors
export const useExamPagination = () => useAdminStore(state => state.examPagination);

export const useQuestionPagination = () => useAdminStore(state => state.questionPagination);

export const useUserPagination = () => useAdminStore(state => state.userPagination);

// Action selectors
export const useAdminActions = () => useAdminStore(state => ({
  // Filter actions
  setExamFilter: state.setExamFilter,
  setUserFilter: state.setUserFilter,
  setQuestionFilter: state.setQuestionFilter,
  
  // Tab actions
  setActiveTab: state.setActiveTab,
  
  // Selection actions
  toggleExamSelection: state.toggleExamSelection,
  toggleQuestionSelection: state.toggleQuestionSelection,
  toggleUserSelection: state.toggleUserSelection,
  selectAllExams: state.selectAllExams,
  selectAllQuestions: state.selectAllQuestions,
  selectAllUsers: state.selectAllUsers,
  clearAllSelections: state.clearAllSelections,
  setBulkActionMode: state.setBulkActionMode,
  
  // Pagination actions
  setExamPagination: state.setExamPagination,
  setQuestionPagination: state.setQuestionPagination,
  setUserPagination: state.setUserPagination,
  
  // UI actions
  setLoading: state.setLoading,
  setError: state.setError,
  clearErrors: state.clearErrors,
  
  // Data actions
  setStats: state.setStats,
  setMetrics: state.setMetrics,
  setExams: state.setExams,
  setQuestions: state.setQuestions,
  setUsers: state.setUsers,
  addExam: state.addExam,
  addQuestion: state.addQuestion,
  updateExam: state.updateExam,
  updateQuestion: state.updateQuestion,
  updateUser: state.updateUser,
  removeExam: state.removeExam,
  removeQuestion: state.removeQuestion,
  markAsRecentlyModified: state.markAsRecentlyModified,
  
  // Modal actions
  openModal: state.openModal,
  closeModal: state.closeModal,
  
  // Utility actions
  reset: state.reset,
  refreshData: state.refreshData,
}));

// Computed selectors
export const useFilteredExams = () => useAdminStore(state => {
  const { exams, examFilter } = state;
  
  return exams.filter(exam => {
    // Status filter
    if (examFilter.status && examFilter.status !== 'all') {
      switch (examFilter.status) {
        case 'published':
          return exam.isPublished;
        case 'draft':
          return exam.isDraft;
        case 'archived':
          return false; // No archived property in current type
        default:
          break;
      }
    }

    // Search filter
    if (examFilter.search) {
      const searchLower = examFilter.search.toLowerCase();
      const matchesSearch = 
        exam.name.toLowerCase().includes(searchLower) ||
        (exam.description && exam.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    return true;
  });
});

export const useFilteredQuestions = () => useAdminStore(state => {
  const { questions, questionFilter } = state;
  
  return questions.filter(question => {
    // Difficulty filter 
    if (questionFilter.difficulty && question.difficulty !== questionFilter.difficulty) {
      return false;
    }
    
    // Subject filter
    if (questionFilter.subject && question.subject !== questionFilter.subject) {
      return false;
    }
    
    // Search filter (use content since text doesn't exist)
    if (questionFilter.search) {
      const searchLower = questionFilter.search.toLowerCase();
      const matchesSearch = 
        question.content.toLowerCase().includes(searchLower) ||
        question.subject.toLowerCase().includes(searchLower) ||
        question.topic.toLowerCase().includes(searchLower) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    return true;
  });
});

export const useFilteredUsers = () => useAdminStore(state => {
  const { users, userFilter } = state;
  
  return users.filter(user => {
    // Role filter (fix enum mismatch)
    if (userFilter.role && userFilter.role !== 'all') {
      switch (userFilter.role) {
        case 'student':
          return user.role === 'USER';
        case 'admin':
          return user.role === 'ADMIN';
        case 'active':
          return true; // No isActive property, assume all are active
        case 'inactive':
          return false; // No isActive property
        default:
          break;
      }
    }
    
    // Search filter
    if (userFilter.search) {
      const searchLower = userFilter.search.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    return true;
  });
});

// Dashboard computed stats
export const useDashboardStats = () => useAdminStore(state => {
  const { exams, questions, users } = state;
  
  return {
    totalExams: exams.length,
    publishedExams: exams.filter(e => e.isPublished).length,
    draftExams: exams.filter(e => e.isDraft).length,
    totalStudents: users.filter(u => u.role === 'USER').length,
    totalAdmins: users.filter(u => u.role === 'ADMIN').length,
    totalQuestions: questions.length,
    totalUsers: users.length,
  };
});
