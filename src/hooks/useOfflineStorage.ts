import { useCallback } from 'react';

const STORAGE_KEYS = {
  CONTENT: 'shiksha_setu_content',
  PROGRESS: 'shiksha_setu_progress',
  QUIZZES: 'shiksha_setu_quizzes',
  QUIZ_SCORES: 'shiksha_setu_quiz_scores',
  PENDING_SYNC: 'shiksha_setu_pending_sync',
};

interface PendingSync {
  type: 'progress' | 'quiz_score';
  data: Record<string, unknown>;
  timestamp: number;
}

export function useOfflineStorage() {
  // Save content to localStorage
  const saveContent = useCallback((content: unknown[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
    } catch (error) {
      console.error('Error saving content to localStorage:', error);
    }
  }, []);

  // Get cached content
  const getContent = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTENT);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading content from localStorage:', error);
      return [];
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((progress: unknown[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }, []);

  // Get cached progress
  const getProgress = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
      return [];
    }
  }, []);

  // Save quizzes to localStorage
  const saveQuizzes = useCallback((quizzes: unknown[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error);
    }
  }, []);

  // Get cached quizzes
  const getQuizzes = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading quizzes from localStorage:', error);
      return [];
    }
  }, []);

  // Save quiz scores to localStorage
  const saveQuizScores = useCallback((scores: unknown[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(scores));
    } catch (error) {
      console.error('Error saving quiz scores to localStorage:', error);
    }
  }, []);

  // Get cached quiz scores
  const getQuizScores = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading quiz scores from localStorage:', error);
      return [];
    }
  }, []);

  // Add item to pending sync queue
  const addPendingSync = useCallback((item: Omit<PendingSync, 'timestamp'>) => {
    try {
      const pending = getPendingSync();
      pending.push({ ...item, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    } catch (error) {
      console.error('Error adding to pending sync:', error);
    }
  }, []);

  // Get pending sync items
  const getPendingSync = useCallback((): PendingSync[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading pending sync:', error);
      return [];
    }
  }, []);

  // Clear pending sync queue
  const clearPendingSync = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }, []);

  return {
    saveContent,
    getContent,
    saveProgress,
    getProgress,
    saveQuizzes,
    getQuizzes,
    saveQuizScores,
    getQuizScores,
    addPendingSync,
    getPendingSync,
    clearPendingSync,
  };
}
