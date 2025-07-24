// Dashboard Constants
export const EXAM_FILTERS = {
  ALL: 'all' as const,
  PUBLISHED: 'published' as const,
  DRAFT: 'draft' as const,
} as const;

export const DASHBOARD_ROUTES = {
  EXAM_BUILDER: '/admin/exam/create',
  QUESTION_BANK: '/admin/questionbank',
  RANKINGS: '/rankings',
} as const;

export const UI_MESSAGES = {
  LOADING: 'Loading dashboard data...',
  NO_EXAMS: 'No exams found. Create your first exam to get started!',
  NO_FILTERED_EXAMS: (filter: string) => `No ${filter} exams found.`,
  EXAM_DELETED: (name: string) => `Exam "${name}" deleted`,
  RANKINGS_COMING_SOON: 'Rankings feature coming soon!',
  DELETE_ALL_CONFIRMATION: (count: number) => 
    `Are you sure you want to delete ALL ${count} exams? This action cannot be undone.`,
} as const;

export const TOAST_MESSAGES = {
  SUCCESS: {
    EXAM_PUBLISHED: 'Exam published successfully',
    EXAM_UNPUBLISHED: 'Exam unpublished successfully',
    EXAM_DELETED: 'Exam deleted successfully',
    EXAM_RESTORED: 'Exam has been restored',
  },
  ERROR: {
    EXAM_PUBLISH_FAILED: (action: string) => `Failed to ${action} exam`,
    EXAM_DELETE_FAILED: 'Failed to delete exam',
    EXAM_RESTORE_FAILED: 'Failed to restore exam',
  },
  WARNING: {
    DUPLICATE_COMING_SOON: 'Exam duplication feature will be available soon',
  }
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 100,
} as const;
