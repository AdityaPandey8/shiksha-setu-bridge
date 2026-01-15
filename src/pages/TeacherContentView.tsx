/**
 * TeacherContentView Page
 * 
 * Full-screen content preview page for teachers.
 * Route: /teacher/content/:contentId
 * 
 * Features:
 * - Preview content exactly as students see it
 * - Read-only mode (no edit/delete)
 * - Quality check before student access
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { FullScreenContentViewer, ContentData } from '@/components/FullScreenContentViewer';

export default function TeacherContentView() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();

  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in or not teacher
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?role=teacher');
      } else if (role && role !== 'teacher') {
        navigate('/student');
      }
    }
  }, [user, role, authLoading, navigate]);

  // Fetch content data
  const fetchContent = useCallback(async () => {
    if (!contentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (isOnline) {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', contentId)
          .maybeSingle();

        if (data && !error) {
          setContent(data as ContentData);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId, isOnline]);

  useEffect(() => {
    if (user && role === 'teacher') {
      fetchContent();
    }
  }, [user, role, fetchContent]);

  const handleBack = useCallback(() => {
    // Navigate back to teacher dashboard
    navigate('/teacher');
  }, [navigate]);

  if (authLoading) {
    return null;
  }

  return (
    <FullScreenContentViewer
      content={content}
      loading={loading}
      isOffline={!isOnline}
      isCached={false}
      backLabel="Back to Teacher Dashboard"
      backPath="/teacher"
      onBack={handleBack}
    />
  );
}
