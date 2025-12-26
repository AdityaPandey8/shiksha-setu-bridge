import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, HelpCircle, BarChart3, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { MissionBanner } from '@/components/MissionBanner';
import { OfflineBanner, OnlineIndicator } from '@/components/OfflineBanner';
import { ContentCard } from '@/components/ContentCard';
import { QuizCard } from '@/components/QuizCard';
import { CareerGuidance } from '@/components/CareerGuidance';
import { EbookViewer } from '@/components/EbookViewer';
import { StudentLearningHub } from '@/components/StudentLearningHub';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf';
  class: string;
  language: 'hindi' | 'english';
}

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  class: string;
  language: 'hindi' | 'english';
}

interface ProgressItem {
  content_id: string;
  completed: boolean;
}

interface QuizScore {
  quiz_id: string;
  score: number;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();
  const {
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
  } = useOfflineStorage();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  // Filters
  const [classFilter, setClassFilter] = useState<string>(profile?.class || 'all');
  const [languageFilter, setLanguageFilter] = useState<string>(profile?.language || 'all');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=student');
    }
  }, [user, authLoading, navigate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (isOnline) {
        // Fetch from server
        const [contentRes, quizzesRes, progressRes, scoresRes] = await Promise.all([
          supabase.from('content').select('*'),
          supabase.from('quizzes').select('*'),
          supabase.from('progress').select('content_id, completed').eq('user_id', user?.id),
          supabase.from('quiz_scores').select('quiz_id, score').eq('user_id', user?.id),
        ]);

        if (contentRes.data) {
          setContent(contentRes.data as ContentItem[]);
          saveContent(contentRes.data);
        }

        if (quizzesRes.data) {
          const formattedQuizzes = quizzesRes.data.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          })) as QuizItem[];
          setQuizzes(formattedQuizzes);
          saveQuizzes(formattedQuizzes);
        }

        if (progressRes.data) {
          setProgress(progressRes.data);
          saveProgress(progressRes.data);
        }

        if (scoresRes.data) {
          setQuizScores(scoresRes.data);
          saveQuizScores(scoresRes.data);
        }

        // Sync pending changes
        await syncPendingChanges();
      } else {
        // Load from cache
        setContent(getContent());
        setQuizzes(getQuizzes());
        setProgress(getProgress());
        setQuizScores(getQuizScores());

        toast({
          title: t('offlineMode'),
          description: t('loadingCachedContent'),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fall back to cache on error
      setContent(getContent());
      setQuizzes(getQuizzes());
      setProgress(getProgress());
      setQuizScores(getQuizScores());
    } finally {
      setLoading(false);
    }
  }, [isOnline, user?.id, saveContent, saveQuizzes, saveProgress, saveQuizScores, getContent, getQuizzes, getProgress, getQuizScores, toast, t]);

  const syncPendingChanges = async () => {
    const pending = getPendingSync();
    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        if (item.type === 'progress') {
          const progressData = item.data as { user_id: string; content_id: string; completed: boolean; completed_at: string };
          await supabase.from('progress').upsert(progressData);
        } else if (item.type === 'quiz_score') {
          const scoreData = item.data as { user_id: string; quiz_id: string; score: number; total_questions: number };
          await supabase.from('quiz_scores').insert(scoreData);
        }
      } catch (error) {
        console.error('Error syncing:', error);
      }
    }

    clearPendingSync();
    toast({
      title: t('synced'),
      description: t('offlineProgressSaved'),
    });
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncPendingChanges();
    }
  }, [isOnline, user]);

  const handleMarkComplete = async (contentId: string) => {
    setMarkingComplete(contentId);

    const progressData = {
      user_id: user?.id,
      content_id: contentId,
      completed: true,
      completed_at: new Date().toISOString(),
    };

    // Optimistic update
    setProgress(prev => [...prev.filter(p => p.content_id !== contentId), { content_id: contentId, completed: true }]);

      try {
        if (isOnline) {
          await supabase.from('progress').upsert(progressData as any);
        } else {
          addPendingSync({ type: 'progress', data: progressData as Record<string, unknown> });
        }

        // Save to local storage
        saveProgress([...progress.filter(p => p.content_id !== contentId), { content_id: contentId, completed: true }]);

        toast({
          title: t('progressSaved'),
          description: isOnline ? t('progressRecorded') : t('willSyncWhenOnline'),
        });
      } catch (error) {
        console.error('Error marking complete:', error);
        addPendingSync({ type: 'progress', data: progressData as Record<string, unknown> });
    } finally {
      setMarkingComplete(null);
    }
  };

  const handleQuizSubmit = async (quizId: string, selectedAnswer: number, isCorrect: boolean) => {
    const scoreData = {
      user_id: user?.id,
      quiz_id: quizId,
      score: isCorrect ? 1 : 0,
      total_questions: 1,
    };

    setQuizScores(prev => [...prev, { quiz_id: quizId, score: isCorrect ? 1 : 0 }]);

    try {
      if (isOnline) {
        await supabase.from('quiz_scores').insert(scoreData as any);
      } else {
        addPendingSync({ type: 'quiz_score', data: scoreData as Record<string, unknown> });
      }

      saveQuizScores([...quizScores, { quiz_id: quizId, score: isCorrect ? 1 : 0 }]);
    } catch (error) {
      console.error('Error saving quiz score:', error);
      addPendingSync({ type: 'quiz_score', data: scoreData as Record<string, unknown> });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Filter content and quizzes
  const filteredContent = content.filter(item => {
    if (classFilter !== 'all' && item.class !== classFilter) return false;
    if (languageFilter !== 'all' && item.language !== languageFilter) return false;
    return true;
  });

  const filteredQuizzes = quizzes.filter(item => {
    if (classFilter !== 'all' && item.class !== classFilter) return false;
    if (languageFilter !== 'all' && item.language !== languageFilter) return false;
    return true;
  });

  // Calculate stats
  const completedCount = progress.filter(p => p.completed).length;
  const totalContent = filteredContent.length;
  const progressPercent = totalContent > 0 ? (completedCount / totalContent) * 100 : 0;

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
      <MissionBanner />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('studentLearningApp')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('welcome')}, {profile?.full_name || t('student')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <OnlineIndicator />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Student Learning Hub - Quick Navigation Cards */}
        <StudentLearningHub />

        {/* My E-Books Section - Offline First */}
        <div className="mb-6">
          <EbookViewer />
        </div>

        {/* Career Guidance Section - Offline First */}
        <CareerGuidance />

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t('yourProgress')}
              </CardTitle>
              <span className="text-sm font-medium">
                {completedCount} / {totalContent} {t('completed')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {progressPercent.toFixed(0)}% {t('complete')}
            </p>
          </CardContent>
        </Card>

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

        {/* Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('lessons')} ({filteredContent.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {t('quizzes')} ({filteredQuizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
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
                    completed={progress.some(p => p.content_id === item.id && p.completed)}
                    onMarkComplete={handleMarkComplete}
                    loading={markingComplete === item.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes">
            {filteredQuizzes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('noQuizzesAvailable')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    id={quiz.id}
                    question={quiz.question}
                    options={quiz.options}
                    correctAnswer={quiz.correct_answer}
                    language={quiz.language}
                    onSubmit={handleQuizSubmit}
                    alreadyAttempted={quizScores.some(s => s.quiz_id === quiz.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
