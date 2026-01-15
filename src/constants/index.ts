/**
 * Application Constants
 * 
 * Centralized constants to avoid magic strings and numbers
 * scattered throughout the codebase.
 */

// ============= Storage Keys =============

export const STORAGE_KEYS = {
  // Auth & User
  OFFLINE_AUTH: 'offlineAuthData',
  OFFLINE_SESSION_ACTIVE: 'offlineSessionActive',
  USER_SETTINGS: 'shiksha_setu_user_settings',
  PENDING_PASSWORD: 'shiksha_setu_pending_password',
  
  // Content Cache
  QUIZZES: 'shiksha_setu_quizzes',
  QUIZ_SCORES: 'shiksha_setu_quiz_scores',
  CONTENT: 'shiksha_setu_content',
  PROGRESS: 'shiksha_setu_progress',
  PENDING_SYNC: 'shiksha_setu_pending_sync',
  
  // Preferences
  LANGUAGE: 'shiksha_setu_language',
  LOGIN_STREAK: 'shiksha_setu_login_streak',
} as const;

// ============= Storage Limits =============

export const STORAGE_LIMITS = {
  /** Maximum offline storage in bytes (400MB) */
  MAX_BYTES: 400 * 1024 * 1024,
  /** Maximum offline storage in MB */
  MAX_MB: 400,
  /** Days before old cache is considered stale */
  OLD_CACHE_DAYS: 30,
  /** Maximum image width for compression */
  MAX_IMAGE_WIDTH: 1200,
  /** JPEG compression quality */
  IMAGE_QUALITY: 0.8,
} as const;

// ============= Validation Rules =============

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  CONTENT: {
    TITLE_MAX: 200,
    DESCRIPTION_MAX: 1000,
    ARTICLE_BODY_MAX: 50000,
    URL_MAX: 2048,
  },
} as const;

// ============= UI Constants =============

export const UI = {
  /** Toast auto-dismiss delay in ms */
  TOAST_DURATION: 5000,
  /** Debounce delay for filter changes in ms */
  FILTER_DEBOUNCE: 300,
  /** Animation durations in ms */
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  /** Pagination defaults */
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const;

// ============= Class & Language Options =============

export const CLASS_OPTIONS = ['6', '7', '8', '9', '10'] as const;
export const LANGUAGE_OPTIONS = ['hindi', 'english'] as const;

export const CONTENT_TYPE_ICONS = {
  video: 'Video',
  article: 'FileText',
  pdf: 'File',
  image: 'Image',
} as const;

export const CONTENT_TYPE_LABELS = {
  video: 'Video',
  article: 'Article',
  pdf: 'PDF',
  image: 'Image',
} as const;

// ============= Route Paths =============

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  INSTALL: '/install',
  SETTINGS: '/settings',
  
  // Student
  STUDENT: {
    DASHBOARD: '/student',
    EBOOKS: '/student/ebooks',
    CONTENT: '/student/content',
    CONTENT_VIEW: '/student/content/:contentId',
    QUIZZES: '/student/quizzes',
    CAREER: '/student/career',
    STUDY_TOOLS: '/student/study-tools',
    SETU_SAARTHI: '/student/setu-saarthi',
  },
  
  // Teacher
  TEACHER: {
    DASHBOARD: '/teacher',
    CONTENT_VIEW: '/teacher/content/:contentId',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin',
  },
} as const;

// ============= Error Messages =============

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  OFFLINE_REQUIRED: 'This feature requires an internet connection.',
  STORAGE_FULL: 'Storage limit exceeded. Please free up space.',
  AUTH_REQUIRED: 'Please log in to continue.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'Please check your input and try again.',
} as const;

// ============= Success Messages =============

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  DOWNLOADED: 'Content downloaded for offline use.',
  SYNCED: 'Data synchronized successfully.',
} as const;
