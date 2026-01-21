/**
 * useStudentSubjects Hook
 * 
 * Manages student's selected subjects for personalized content filtering.
 * Stores in profile.selected_subjects and caches locally for offline use.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';

const STUDENT_SUBJECTS_KEY = 'shiksha_setu_student_subjects';
const PENDING_SUBJECTS_KEY = 'shiksha_setu_pending_subjects';

interface UseStudentSubjectsReturn {
  selectedSubjects: string[];
  loading: boolean;
  saving: boolean;
  hasSelectedSubjects: boolean;
  saveSelectedSubjects: (subjects: string[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useStudentSubjects(): UseStudentSubjectsReturn {
  const { user, role } = useAuth();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSelectedSubjects = useCallback(async () => {
    if (!user || role !== 'student') {
      setSelectedSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Load from cache first
      const cached = localStorage.getItem(STUDENT_SUBJECTS_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.userId === user.id) {
            setSelectedSubjects(parsed.subjects || []);
          }
        } catch {
          // Invalid cache
        }
      }

      // Fetch from backend if online
      if (isOnline) {
        const { data, error } = await supabase
          .from('profiles')
          .select('selected_subjects')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const subjects = data?.selected_subjects || [];
        setSelectedSubjects(subjects);
        localStorage.setItem(STUDENT_SUBJECTS_KEY, JSON.stringify({
          userId: user.id,
          subjects,
        }));

        // Sync any pending changes
        const pending = localStorage.getItem(PENDING_SUBJECTS_KEY);
        if (pending) {
          const pendingData = JSON.parse(pending);
          if (pendingData.userId === user.id) {
            await syncPendingSubjects(pendingData.subjects);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching student subjects:', err);
    } finally {
      setLoading(false);
    }
  }, [user, role, isOnline]);

  const syncPendingSubjects = async (subjects: string[]) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_subjects: subjects })
        .eq('id', user?.id);

      if (!error) {
        localStorage.removeItem(PENDING_SUBJECTS_KEY);
        setSelectedSubjects(subjects);
        localStorage.setItem(STUDENT_SUBJECTS_KEY, JSON.stringify({
          userId: user?.id,
          subjects,
        }));
      }
    } catch {
      // Silent fail, will retry next time
    }
  };

  useEffect(() => {
    fetchSelectedSubjects();
  }, [fetchSelectedSubjects]);

  // Auto-sync pending changes when coming online
  useEffect(() => {
    if (isOnline && user) {
      const pending = localStorage.getItem(PENDING_SUBJECTS_KEY);
      if (pending) {
        try {
          const pendingData = JSON.parse(pending);
          if (pendingData.userId === user.id) {
            syncPendingSubjects(pendingData.subjects);
          }
        } catch {
          // Invalid pending data
        }
      }
    }
  }, [isOnline, user]);

  const saveSelectedSubjects = useCallback(async (subjects: string[]) => {
    if (!user) return;

    setSaving(true);

    try {
      if (isOnline) {
        const { error } = await supabase
          .from('profiles')
          .update({ selected_subjects: subjects })
          .eq('id', user.id);

        if (error) throw error;

        setSelectedSubjects(subjects);
        localStorage.setItem(STUDENT_SUBJECTS_KEY, JSON.stringify({
          userId: user.id,
          subjects,
        }));
        localStorage.removeItem(PENDING_SUBJECTS_KEY);

        toast({
          title: 'Subjects saved',
          description: 'Your subject preferences have been updated.',
        });
      } else {
        // Save locally for later sync
        setSelectedSubjects(subjects);
        localStorage.setItem(STUDENT_SUBJECTS_KEY, JSON.stringify({
          userId: user.id,
          subjects,
        }));
        localStorage.setItem(PENDING_SUBJECTS_KEY, JSON.stringify({
          userId: user.id,
          subjects,
        }));

        toast({
          title: 'Saved offline',
          description: 'Your subjects will sync when you\'re back online.',
        });
      }
    } catch (err: any) {
      console.error('Error saving subjects:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save subject preferences.',
      });
    } finally {
      setSaving(false);
    }
  }, [user, isOnline, toast]);

  return {
    selectedSubjects,
    loading,
    saving,
    hasSelectedSubjects: selectedSubjects.length > 0,
    saveSelectedSubjects,
    refetch: fetchSelectedSubjects,
  };
}
