/**
 * useTeacherAllocation Hook
 * 
 * Fetches the teacher's allocated subjects, classes, and languages.
 * Caches data locally for offline use.
 * Returns empty arrays if teacher has no allocation (restricts all content creation).
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const ALLOCATION_CACHE_KEY = 'shiksha_setu_teacher_allocation';

interface TeacherAllocation {
  subjects: string[];
  classes: string[];
  languages: string[];
  isActive: boolean;
}

interface UseTeacherAllocationReturn {
  allocation: TeacherAllocation | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isSubjectAllowed: (subject: string) => boolean;
  isClassAllowed: (cls: string) => boolean;
  isLanguageAllowed: (lang: string) => boolean;
}

export function useTeacherAllocation(): UseTeacherAllocationReturn {
  const { user, role } = useAuth();
  const isOnline = useOnlineStatus();
  const [allocation, setAllocation] = useState<TeacherAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocation = useCallback(async () => {
    if (!user || role !== 'teacher') {
      setAllocation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load from cache first
      const cached = localStorage.getItem(ALLOCATION_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.teacherId === user.id) {
            setAllocation(parsed.allocation);
          }
        } catch {
          // Invalid cache, ignore
        }
      }

      // Fetch from backend if online
      if (isOnline) {
        const { data, error: fetchError } = await supabase
          .from('teacher_assignments')
          .select('subjects, classes, languages, is_active')
          .eq('teacher_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          const alloc: TeacherAllocation = {
            subjects: data.subjects || [],
            classes: data.classes || [],
            languages: data.languages || ['hindi', 'english'],
            isActive: data.is_active,
          };
          setAllocation(alloc);
          localStorage.setItem(ALLOCATION_CACHE_KEY, JSON.stringify({
            teacherId: user.id,
            allocation: alloc,
          }));
        } else {
          // No allocation found - teacher has no permissions
          setAllocation({
            subjects: [],
            classes: [],
            languages: [],
            isActive: false,
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching teacher allocation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role, isOnline]);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  const isSubjectAllowed = useCallback((subject: string) => {
    if (!allocation) return false;
    return allocation.subjects.some(s => 
      s.toLowerCase() === subject.toLowerCase()
    );
  }, [allocation]);

  const isClassAllowed = useCallback((cls: string) => {
    if (!allocation) return false;
    return allocation.classes.includes(cls);
  }, [allocation]);

  const isLanguageAllowed = useCallback((lang: string) => {
    if (!allocation) return false;
    return allocation.languages.includes(lang);
  }, [allocation]);

  return {
    allocation,
    loading,
    error,
    refetch: fetchAllocation,
    isSubjectAllowed,
    isClassAllowed,
    isLanguageAllowed,
  };
}
