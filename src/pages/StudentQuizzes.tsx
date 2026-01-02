/**
 * StudentQuizzes Page
 * 
 * Dedicated page for practice quizzes with offline-first functionality.
 * 
 * OFFLINE BEHAVIOR:
 * - Loads quizzes from localStorage first (shiksha_setu_quizzes)
 * - Silently syncs with backend when online
 * - Quiz scores saved locally and synced when online
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Filter, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { QuizCard } from '@/components/QuizCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useToast } from '@/hooks/use-toast';

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  class: string;
  language: 'hindi' | 'english';
}

interface QuizScore {
  quiz_id: string;
  score: number;
}

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();
  const { saveQuizzes, getQuizzes, saveQuizScores, getQuizScores, addPendingSync } = useOfflineStorage();

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
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
      const cachedQuizzes = getQuizzes();
      const cachedScores = getQuizScores();

      if (cachedQuizzes.length > 0) {
        setQuizzes(cachedQuizzes);
        setQuizScores(cachedScores);
      }

      // If online, sync with backend
      if (isOnline) {
        const [quizzesRes, scoresRes] = await Promise.all([
          supabase.from('quizzes').select('*'),
          supabase.from('quiz_scores').select('quiz_id, score').eq('user_id', user?.id),
        ]);

        if (quizzesRes.data) {
          const formattedQuizzes = quizzesRes.data.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          })) as QuizItem[];
          setQuizzes(formattedQuizzes);
          saveQuizzes(formattedQuizzes);
        }

        if (scoresRes.data) {
          setQuizScores(scoresRes.data);
          saveQuizScores(scoresRes.data);
        }
      } else if (cachedQuizzes.length === 0) {
        toast({
          title: t('offlineMode'),
          description: t('loadingCachedContent'),
        });
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setQuizzes(getQuizzes());
      setQuizScores(getQuizScores());
    } finally {
      setLoading(false);
    }
  }, [isOnline, user?.id, saveQuizzes, getQuizzes, saveQuizScores, getQuizScores, toast, t]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

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

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(item => {
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
              <div className="p-2 rounded-lg bg-orange-500/10">
                <FileQuestion className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('hubQuizzes')}</h1>
                <p className="text-sm text-muted-foreground">{t('hubQuizzesDesc')}</p>
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

        {/* Quizzes Grid */}
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
                isOnline={isOnline}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
