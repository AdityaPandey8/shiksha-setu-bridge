/**
 * Shared Type Definitions
 * 
 * Centralized types used across the application to avoid duplication
 * and ensure type consistency.
 */

// ============= User & Auth Types =============

export type AppRole = 'student' | 'teacher' | 'admin';
export type ContentLanguage = 'hindi' | 'english';
export type ContentType = 'video' | 'article' | 'pdf' | 'image';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  class: string | null;
  language: ContentLanguage | null;
  created_at: string;
  updated_at: string;
}

// ============= Content Types =============

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: ContentType;
  class: string;
  language: ContentLanguage;
  article_body?: string | null;
  image_url?: string | null;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  class: string;
  language: ContentLanguage;
}

export interface QuizScore {
  quiz_id: string;
  score: number;
  total_questions?: number;
}

export interface EbookItem {
  id: string;
  title: string;
  subject: string;
  class: string;
  language: ContentLanguage;
  description?: string | null;
  pdf_url: string;
  pdf_filename?: string | null;
  offline_enabled: boolean;
}

// ============= Progress Types =============

export interface ProgressItem {
  id: string;
  user_id: string;
  content_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// ============= Download & Sync Types =============

export interface DownloadProgress {
  contentId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'complete' | 'error';
  error?: string;
}

export interface PendingSync {
  id: string;
  type: 'quiz_score' | 'progress' | 'password';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount?: number;
}

// ============= Storage Types =============

export interface StorageStats {
  ebooks: number;
  quizzes: number;
  content: number;
  careerData: number;
  chatbotSummaries: number;
  totalSizeMB: number;
  limitMB: number;
  percentUsed: number;
}

// ============= Form Validation =============

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ============= API Response Types =============

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ============= Component Props Types =============

export interface BaseCardProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FilterState {
  class: string;
  language: string;
  contentType?: string;
}
