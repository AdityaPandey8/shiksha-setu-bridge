/**
 * useSubjects Hook
 * 
 * Fetches and caches the master list of subjects from the database.
 * Provides offline-first functionality with localStorage caching.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const SUBJECTS_CACHE_KEY = 'shiksha_setu_subjects';

export interface Subject {
  id: string;
  name: string;
  label_en: string;
  label_hi: string;
  is_active: boolean;
  created_at: string;
}

interface UseSubjectsReturn {
  subjects: Subject[];
  activeSubjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getSubjectLabel: (name: string, language: 'hindi' | 'english') => string;
}

export function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load from cache first
      const cached = localStorage.getItem(SUBJECTS_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSubjects(parsed);
        } catch {
          // Invalid cache, ignore
        }
      }

      // Fetch from backend if online
      if (isOnline) {
        const { data, error: fetchError } = await supabase
          .from('subjects')
          .select('*')
          .order('label_en');

        if (fetchError) throw fetchError;

        if (data) {
          setSubjects(data);
          localStorage.setItem(SUBJECTS_CACHE_KEY, JSON.stringify(data));
        }
      }
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const getSubjectLabel = useCallback((name: string, language: 'hindi' | 'english') => {
    const subject = subjects.find(s => s.name === name);
    if (!subject) return name;
    return language === 'hindi' ? subject.label_hi : subject.label_en;
  }, [subjects]);

  const activeSubjects = subjects.filter(s => s.is_active);

  return {
    subjects,
    activeSubjects,
    loading,
    error,
    refetch: fetchSubjects,
    getSubjectLabel,
  };
}
