/**
 * StudentContent Page
 * 
 * Dedicated page for viewing learning content (videos, PDFs, notes).
 * Content is always accessible and reusable - no completion restrictions.
 * 
 * OFFLINE BEHAVIOR:
 * - Loads content from localStorage first (shiksha_setu_content)
 * - Silently syncs with backend when online
 * - Shows cached data without errors when offline
 * - Content remains accessible after multiple views
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Filter, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { ContentCard } from '@/components/ContentCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf' | 'image';
  class: string;
  language: 'hindi' | 'english';
  article_body?: string | null;
  image_url?: string | null;
  version?: number;
}

export default function StudentContent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { saveContent, getContent } = useOfflineStorage();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState<string>(profile?.class || 'all');
  const [languageFilter, setLanguageFilter] = useState<string>(profile?.language || 'all');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=student');
    }
  }, [user, authLoading, navigate]);

  // Fetch data with offline-first approach
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // OFFLINE-FIRST: Load from cache first
      const cachedContent = getContent();

      if (cachedContent.length > 0) {
        setContent(cachedContent);
      }

      // If online, sync with backend
      if (isOnline) {
        const contentRes = await supabase.from('content').select('*');

        if (contentRes.data) {
          setContent(contentRes.data as ContentItem[]);
          saveContent(contentRes.data);
        }
      } else if (cachedContent.length === 0) {
        toast({
          title: t('offlineMode'),
          description: t('loadingCachedContent'),
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Fall back to cache on error
      setContent(getContent());
    } finally {
      setLoading(false);
    }
  }, [isOnline, saveContent, getContent, toast, t]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Filter content
  const filteredContent = content.filter(item => {
    if (classFilter !== 'all' && item.class !== classFilter) return false;
    if (languageFilter !== 'all' && item.language !== languageFilter) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/student')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <FolderOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('hubContent')}</h1>
                <p className="text-sm text-muted-foreground">{t('hubContentDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('filters')}:</span>
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('class')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allClasses')}</SelectItem>
                  <SelectItem value="6">{t('class6')}</SelectItem>
                  <SelectItem value="7">{t('class7')}</SelectItem>
                  <SelectItem value="8">{t('class8')}</SelectItem>
                  <SelectItem value="9">{t('class9')}</SelectItem>
                  <SelectItem value="10">{t('class10')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allLanguages')}</SelectItem>
                  <SelectItem value="hindi">{t('hindi')}</SelectItem>
                  <SelectItem value="english">{t('english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noContentAvailable')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                url={item.url}
                contentType={item.content_type}
                language={item.language}
                articleBody={item.article_body}
                imageUrl={item.image_url}
                version={item.version}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
