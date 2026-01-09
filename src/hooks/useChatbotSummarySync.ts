/**
 * useChatbotSummarySync Hook
 * 
 * Syncs chatbot summaries from server to localStorage for offline use.
 * Students can access these summaries offline through Setu Saarthi.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

const STORAGE_KEY = 'chapter_summaries';
const LAST_SYNC_KEY = 'chapter_summaries_last_sync';

export interface ChapterSummary {
  id: string;
  class: string;
  subject: string;
  chapter_id: string;
  summary_text: string;
  key_points: string[] | null;
  language: 'hindi' | 'english';
  updated_at: string;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  summaryCount: number;
}

export function useChatbotSummarySync() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    summaryCount: 0,
  });

  // Get summaries from localStorage
  const getSummaries = useCallback((): ChapterSummary[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save summaries to localStorage
  const saveSummaries = useCallback((summaries: ChapterSummary[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        summaryCount: summaries.length,
      }));
    } catch (error) {
      console.error('Error saving summaries to localStorage:', error);
    }
  }, []);

  // Sync summaries from server
  const syncSummaries = useCallback(async (showToast = true) => {
    if (!isOnline) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const { data, error } = await supabase
        .from('chatbot_summaries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const summaries = (data as ChapterSummary[]) || [];
      saveSummaries(summaries);

      if (showToast && summaries.length > 0) {
        toast({
          title: '✅ Chatbot knowledge updated',
          description: `${summaries.length} chapter summaries synced`,
        });
      }
    } catch (error) {
      console.error('Error syncing summaries:', error);
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [isOnline, saveSummaries, toast]);

  // Find summary by class, subject, and chapter
  const findSummary = useCallback((
    studentClass: string,
    subject: string,
    chapterId?: string,
    language?: 'hindi' | 'english'
  ): ChapterSummary | null => {
    const summaries = getSummaries();
    
    return summaries.find(s => {
      const classMatch = s.class === studentClass;
      const subjectMatch = s.subject.toLowerCase() === subject.toLowerCase();
      const chapterMatch = !chapterId || s.chapter_id.toLowerCase().includes(chapterId.toLowerCase());
      const langMatch = !language || s.language === language;
      
      return classMatch && subjectMatch && chapterMatch && langMatch;
    }) || null;
  }, [getSummaries]);

  // Search summaries by keyword
  const searchSummaries = useCallback((
    query: string,
    studentClass?: string,
    language?: 'hindi' | 'english'
  ): ChapterSummary[] => {
    const summaries = getSummaries();
    const lowerQuery = query.toLowerCase();

    return summaries.filter(s => {
      const matchesQuery = 
        s.summary_text.toLowerCase().includes(lowerQuery) ||
        s.subject.toLowerCase().includes(lowerQuery) ||
        s.chapter_id.toLowerCase().includes(lowerQuery) ||
        s.key_points?.some(p => p.toLowerCase().includes(lowerQuery));
      
      const classMatch = !studentClass || s.class === studentClass;
      const langMatch = !language || s.language === language;

      return matchesQuery && classMatch && langMatch;
    });
  }, [getSummaries]);

  // Get summaries by subject
  const getSummariesBySubject = useCallback((
    subject: string,
    studentClass?: string
  ): ChapterSummary[] => {
    const summaries = getSummaries();
    return summaries.filter(s => {
      const subjectMatch = s.subject.toLowerCase() === subject.toLowerCase();
      const classMatch = !studentClass || s.class === studentClass;
      return subjectMatch && classMatch;
    });
  }, [getSummaries]);

  // Load initial state from localStorage
  useEffect(() => {
    const storedSummaries = getSummaries();
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    
    setSyncStatus({
      isSyncing: false,
      lastSyncTime: lastSync ? new Date(lastSync) : null,
      summaryCount: storedSummaries.length,
    });
  }, [getSummaries]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      // Small delay to ensure stable connection
      const timer = setTimeout(() => {
        syncSummaries(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncSummaries]);

  return {
    syncStatus,
    syncSummaries,
    getSummaries,
    findSummary,
    searchSummaries,
    getSummariesBySubject,
    isOnline,
  };
}
