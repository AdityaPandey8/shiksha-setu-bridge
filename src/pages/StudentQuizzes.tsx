/**
 * StudentQuizzes Page
 * 
 * Dedicated page for practice quizzes with offline-first functionality.
 * 
 * OFFLINE BEHAVIOR:
 * - Loads quizzes from localStorage first (shiksha_setu_quizzes)
 * - Silently syncs with backend when online
 * - Quiz scores saved locally and synced when online
 * 
 * RESULT SUMMARY:
 * - Shows total attempted, correct, wrong counts
 * - Displays score percentage with performance badge
 * - Retry functionality for wrong answers
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
import { QuizResultSummary } from '@/components/QuizResultSummary';
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

// Track individual quiz attempts for session
interface QuizAttempt {
  quizId: string;
  isCorrect: boolean;
  timestamp: number;
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

  // Session-based attempt tracking for result summary
  const [sessionAttempts, setSessionAttempts] = useState<QuizAttempt[]>([]);
  const [retryMode, setRetryMode] = useState(false);
  const [retryQuizIds, setRetryQuizIds] = useState<Set<string>>(new Set());

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

  /**
   * Handle quiz submission
   * - Tracks attempt in session state
   * - Saves score locally
   * - Syncs with backend when online
   */
  const handleQuizSubmit = async (quizId: string, selectedAnswer: number, isCorrect: boolean) => {
    const scoreData = {
      user_id: user?.id,
      quiz_id: quizId,
      score: isCorrect ? 1 : 0,
      total_questions: 1,
    };

    // Track in session for result summary
    setSessionAttempts(prev => {
      // Remove any previous attempt for this quiz (for retries)
      const filtered = prev.filter(a => a.quizId !== quizId);
      return [...filtered, { quizId, isCorrect, timestamp: Date.now() }];
    });

    // Update quiz scores
    setQuizScores(prev => {
      const filtered = prev.filter(s => s.quiz_id !== quizId);
      return [...filtered, { quiz_id: quizId, score: isCorrect ? 1 : 0 }];
    });

    // Remove from retry set if correct
    if (isCorrect && retryQuizIds.has(quizId)) {
      setRetryQuizIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(quizId);
        return newSet;
      });
    }

    try {
      if (isOnline) {
        await supabase.from('quiz_scores').upsert(scoreData as any, { onConflict: 'user_id,quiz_id' });
      } else {
        addPendingSync({ type: 'quiz_score', data: scoreData as Record<string, unknown> });
      }

      saveQuizScores(quizScores);
    } catch (error) {
      console.error('Error saving quiz score:', error);
      addPendingSync({ type: 'quiz_score', data: scoreData as Record<string, unknown> });
    }
  };

  /**
   * Handle retry of wrong answers
   * - Filters to only show incorrectly answered quizzes
   * - Resets their state for new attempt
   */
  const handleRetryWrong = () => {
    const wrongQuizIds = sessionAttempts
      .filter(a => !a.isCorrect)
      .map(a => a.quizId);
    
    setRetryQuizIds(new Set(wrongQuizIds));
    setRetryMode(true);
    
    // Reset session attempts for retry quizzes
    setSessionAttempts(prev => prev.filter(a => a.isCorrect));
    setQuizScores(prev => prev.filter(s => !wrongQuizIds.includes(s.quiz_id)));
  };

  // Exit retry mode
  const handleExitRetry = () => {
    setRetryMode(false);
    setRetryQuizIds(new Set());
  };

  // Calculate result summary stats
  const correctCount = sessionAttempts.filter(a => a.isCorrect).length;
  const wrongCount = sessionAttempts.filter(a => !a.isCorrect).length;
  const totalAttempted = sessionAttempts.length;

  // Filter quizzes
  let filteredQuizzes = quizzes.filter(item => {
    if (classFilter !== 'all' && item.class !== classFilter) return false;
    if (languageFilter !== 'all' && item.language !== languageFilter) return false;
    return true;
  });

  // In retry mode, only show wrong quizzes
  if (retryMode) {
    filteredQuizzes = filteredQuizzes.filter(q => retryQuizIds.has(q.id));
  }

  // Check if quiz was already attempted this session
  const isAttemptedThisSession = (quizId: string) => {
    return sessionAttempts.some(a => a.quizId === quizId);
  };

  const getLastAttemptCorrect = (quizId: string) => {
    const attempt = sessionAttempts.find(a => a.quizId === quizId);
    return attempt?.isCorrect;
  };

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
        {/* Result Summary - shows when quizzes are attempted */}
        <QuizResultSummary
          totalQuestions={totalAttempted}
          correctAnswers={correctCount}
          wrongAnswers={wrongCount}
          onRetryWrong={handleRetryWrong}
          showRetry={!retryMode && wrongCount > 0}
        />

        {/* Retry mode header */}
        {retryMode && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-warning">Retry Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Attempting {retryQuizIds.size} wrong answer{retryQuizIds.size !== 1 ? 's' : ''} again
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExitRetry}>
                  Exit Retry Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
              <p className="text-muted-foreground">
                {retryMode ? 'All wrong answers have been corrected!' : t('noQuizzesAvailable')}
              </p>
              {retryMode && (
                <Button variant="outline" className="mt-4" onClick={handleExitRetry}>
                  Back to All Quizzes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={`${quiz.id}-${retryMode ? 'retry' : 'normal'}`}
                id={quiz.id}
                question={quiz.question}
                options={quiz.options}
                correctAnswer={quiz.correct_answer}
                language={quiz.language}
                onSubmit={handleQuizSubmit}
                alreadyAttempted={isAttemptedThisSession(quiz.id)}
                lastAttemptCorrect={getLastAttemptCorrect(quiz.id)}
                isOnline={isOnline}
                allowRetry={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}