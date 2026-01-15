/**
 * StudentContentView Page
 * 
 * Full-screen content viewing page for students.
 * Route: /student/content/:contentId
 * 
 * Features:
 * - Distraction-free viewing
 * - Offline support with cached content from IndexedDB
 * - Mobile-first design
 * - Back navigation preserves scroll position
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useContentStorage } from '@/hooks/useContentStorage';
import { supabase } from '@/integrations/supabase/client';
import { FullScreenContentViewer, ContentData, CachedContentData } from '@/components/FullScreenContentViewer';

export default function StudentContentView() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { getCachedContentById, isContentCached } = useContentStorage();

  const [content, setContent] = useState<ContentData | null>(null);
  const [cachedContent, setCachedContent] = useState<CachedContentData | null>(null);
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
      // Check IndexedDB cache first
      const cached = await getCachedContentById(contentId);
      if (cached) {
        setCachedContent(cached as CachedContentData);
        setIsCached(true);
      }

      // If online, fetch fresh data from server
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
  }, [contentId, isOnline, getCachedContentById]);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user, fetchContent]);

  // Check cache status
  useEffect(() => {
    if (contentId) {
      setIsCached(isContentCached(contentId));
    }
  }, [contentId, isContentCached]);

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
      cachedContent={cachedContent}
      loading={loading}
      isOffline={!isOnline}
      isCached={isCached}
      backLabel="Back to Learning Content"
      backPath="/student/content"
      onBack={handleBack}
    />
  );
}
