import { useLiveQuery } from 'dexie-react-hooks';
import { useState, useCallback } from 'react';
import { 
  db, 
  getCachedEbooks, 
  cacheEbook, 
  deleteEbook,
  getCachedQuizzes,
  cacheQuizzes,
  getChatbotSummaries,
  cacheChatbotSummaries,
  getStorageStats,
  clearAllCache,
  clearOldCache,
  type CachedEbook,
  type CachedQuiz,
  type CachedChatbotSummary
} from '@/lib/db';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';

export function useIndexedDBEbooks(filters?: { class?: string; subject?: string; language?: string }) {
  const ebooks = useLiveQuery(
    () => getCachedEbooks(filters),
    [filters?.class, filters?.subject, filters?.language]
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadEbook = useCallback(async (ebook: {
    id: string;
    title: string;
    subject: string;
    class: string;
    language: 'hindi' | 'english';
    description?: string;
    pdf_url: string;
  }) => {
    setIsDownloading(true);
    try {
      // Fetch PDF blob
      const response = await fetch(ebook.pdf_url);
      const blob = await response.blob();
      
      await cacheEbook({
        id: ebook.id,
        title: ebook.title,
        subject: ebook.subject,
        class: ebook.class,
        language: ebook.language,
        description: ebook.description,
        pdfUrl: ebook.pdf_url,
        pdfBlob: blob,
        sizeBytes: blob.size
      });

      return true;
    } catch (error) {
      console.error('Failed to download ebook:', error);
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const removeEbook = useCallback(async (id: string) => {
    await deleteEbook(id);
  }, []);

  const isEbookCached = useCallback((id: string) => {
    return ebooks?.some(e => e.id === id) ?? false;
  }, [ebooks]);

  return {
    cachedEbooks: ebooks ?? [],
    isDownloading,
    downloadEbook,
    removeEbook,
    isEbookCached
  };
}

export function useIndexedDBQuizzes(filters?: { class?: string; language?: string }) {
  const isOnline = useOnlineStatus();
  const quizzes = useLiveQuery(
    () => getCachedQuizzes(filters),
    [filters?.class, filters?.language]
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const syncQuizzes = useCallback(async (userClass?: string, language?: string) => {
    if (!isOnline) return false;
    
    setIsSyncing(true);
    try {
      let query = supabase.from('quizzes').select('*');
      
      if (userClass) {
        query = query.eq('class', userClass);
      }
      if (language) {
        query = query.eq('language', language as 'hindi' | 'english');
      }

      const { data, error } = await query;
      
      if (error) throw error;

      if (data && data.length > 0) {
        await cacheQuizzes(data.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correctAnswer: q.correct_answer,
          class: q.class,
          language: q.language as 'hindi' | 'english'
        })));
      }

      return true;
    } catch (error) {
      console.error('Failed to sync quizzes:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  return {
    cachedQuizzes: quizzes ?? [],
    isSyncing,
    syncQuizzes
  };
}

export function useIndexedDBChatbotSummaries(filters?: { class?: string; subject?: string }) {
  const isOnline = useOnlineStatus();
  const summaries = useLiveQuery(
    () => getChatbotSummaries(filters),
    [filters?.class, filters?.subject]
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const syncSummaries = useCallback(async (userClass?: string) => {
    if (!isOnline) return false;
    
    setIsSyncing(true);
    try {
      let query = supabase.from('chatbot_summaries').select('*');
      
      if (userClass) {
        query = query.eq('class', userClass);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      if (data && data.length > 0) {
        await cacheChatbotSummaries(data.map(s => ({
          id: s.id,
          chapterId: s.chapter_id,
          subject: s.subject,
          class: s.class,
          summaryText: s.summary_text,
          keyPoints: s.key_points ?? undefined,
          language: s.language as 'hindi' | 'english'
        })));
      }

      return true;
    } catch (error) {
      console.error('Failed to sync chatbot summaries:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  return {
    cachedSummaries: summaries ?? [],
    isSyncing,
    syncSummaries
  };
}

export function useStorageStats() {
  const stats = useLiveQuery(() => getStorageStats());

  const clearCache = useCallback(async () => {
    await clearAllCache();
  }, []);

  const clearOld = useCallback(async (days: number = 30) => {
    await clearOldCache(days);
  }, []);

  return {
    stats: stats ?? {
      ebooks: 0,
      quizzes: 0,
      content: 0,
      careerData: 0,
      chatbotSummaries: 0,
      totalEbookSizeMB: 0
    },
    clearCache,
    clearOld
  };
}
