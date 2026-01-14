/**
 * StudentContentView Page
 * 
 * Full-screen content viewing page for students.
 * Route: /student/content/:contentId
 * 
 * Features:
 * - Distraction-free viewing
 * - Offline support with cached content
 * - Mobile-first design
 * - Back navigation preserves scroll position
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { FullScreenContentViewer, ContentData } from '@/components/FullScreenContentViewer';

export default function StudentContentView() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { getContent } = useOfflineStorage();

  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=student');
    }
  }, [user, authLoading, navigate]);

  // Fetch content data
  const fetchContent = useCallback(async () => {
    if (!contentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Check cache first
      const cachedContent = getContent();
      const cachedItem = cachedContent.find((c: ContentData) => c.id === contentId);
      
      if (cachedItem) {
        setContent(cachedItem);
        setIsCached(true);
      }

      // If online, fetch fresh data
      if (isOnline) {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', contentId)
          .single();

        if (data && !error) {
          setContent(data as ContentData);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId, isOnline, getContent]);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user, fetchContent]);

  const handleBack = useCallback(() => {
    // Navigate back to content list, preserving history
    navigate('/student/content');
  }, [navigate]);

  if (authLoading) {
    return null;
  }

  return (
    <FullScreenContentViewer
      content={content}
      loading={loading}
      isOffline={!isOnline}
      isCached={isCached}
      backLabel="Back to Learning Content"
      backPath="/student/content"
      onBack={handleBack}
    />
  );
}
