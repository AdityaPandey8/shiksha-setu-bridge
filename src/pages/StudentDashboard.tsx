import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Loader2, Flame, Settings, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useLoginStreak } from '@/hooks/useLoginStreak';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { MissionBanner } from '@/components/MissionBanner';
import { OfflineModeBanner, ConnectionStatus } from '@/components/ConnectionStatus';
import { StudentLearningHub } from '@/components/StudentLearningHub';
import { OfflineChatbot } from '@/components/OfflineChatbot';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * StudentDashboard - Clean Feature Selector
 * 
 * This dashboard acts as a simple navigation hub.
 * All feature content (E-Books, Content, Quizzes, Career) 
 * lives on their dedicated pages - NOT here.
 * 
 * HYBRID OFFLINE-FIRST BEHAVIOR:
 * - Shows real-time connectivity status (green/yellow indicator)
 * - Auto-syncs data when coming back online
 * - Provides offline utilities (bookmarks, notes, flashcards)
 * - Includes offline chatbot for assistance
 * - Supports offline login with previously saved credentials
 */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { t, language: preferredLanguage } = useLanguage();
  const { isOnline, getOfflineAuthData } = useOfflineAuth();
  const [offlineSession, setOfflineSession] = useState(false);
  
  // Get offline auth data for offline sessions
  const offlineData = getOfflineAuthData();
  
  // Login Streak - Offline-first tracking
  const { streakCount, streakBroken, isOnline: streakOnline } = useLoginStreak(
    user?.email || offlineData?.email,
    profile?.full_name || offlineData?.name || 'Student'
  );

  // Check for offline session
  useEffect(() => {
    const isOfflineSession = localStorage.getItem('offlineSessionActive') === 'true';
    setOfflineSession(isOfflineSession && !isOnline);
  }, [isOnline]);

  // Redirect if not logged in (online) and no offline session
  useEffect(() => {
    if (!authLoading && !user) {
      const isOfflineSession = localStorage.getItem('offlineSessionActive') === 'true';
      const hasOfflineData = offlineData !== null;
      
      if (!isOnline && isOfflineSession && hasOfflineData) {
        // Allow offline session
        setOfflineSession(true);
      } else if (isOnline || !hasOfflineData) {
        navigate('/auth?role=student');
      }
    }
  }, [user, authLoading, navigate, isOnline, offlineData]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineSession) {
      // Clear offline session flag when back online with a real session
      if (user) {
        localStorage.removeItem('offlineSessionActive');
        setOfflineSession(false);
      }
    }
  }, [isOnline, user, offlineSession]);

  const handleLogout = async () => {
    localStorage.removeItem('offlineSessionActive');
    if (user) {
      await signOut();
    }
    navigate('/');
  };

  // Get display name - from profile (online) or offline data
  const displayName = profile?.full_name || offlineData?.name || t('student');

  if (authLoading && !offlineSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Login Banner */}
      {offlineSession && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            {preferredLanguage === 'hi' 
              ? 'ऑफलाइन मोड: सहेजी गई एक्सेस से लॉगिन'
              : 'Offline Mode: Logged in using saved access'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Offline Streak Banner - Show when offline */}
      {!streakOnline && streakCount > 0 && !offlineSession && (
        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-300">
          {t('offlineStreakSaved')}
        </div>
      )}
      {/* Offline/Syncing Banner */}
      <OfflineModeBanner />
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold">{t('studentLearningApp')}</h1>
                  {/* Login Streak Badge */}
                  {streakCount > 0 && (
                    <Badge 
                      variant="outline" 
                      className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                    >
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {t('loginStreak')}: {streakCount > 1 
                        ? t('loginStreakDays', { count: String(streakCount) })
                        : t('loginStreakDay')
                      }
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('welcome')}, {displayName} ({t('student')})
                </p>
                {/* Streak broken notification */}
                {streakBroken && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {t('streakBroken')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Real-time Connectivity Status */}
              <ConnectionStatus />
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title={t('profileSettings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Learning Hub Navigation Cards */}
      <main className="container mx-auto px-4 py-6">
        <StudentLearningHub />
      </main>

      {/* Floating Offline Chatbot */}
      <OfflineChatbot />
    </div>
  );
}
