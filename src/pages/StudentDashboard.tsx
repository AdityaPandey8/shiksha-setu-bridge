import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Flame, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useLoginStreak } from '@/hooks/useLoginStreak';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { MissionBanner } from '@/components/MissionBanner';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OfflineModeBanner, ConnectionStatus } from '@/components/ConnectionStatus';
import { StudentLearningHub } from '@/components/StudentLearningHub';
import { OfflineChatbot } from '@/components/OfflineChatbot';
import { DailyTip } from '@/components/DailyTip';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * StudentDashboard - Clean, Professional Learning Hub
 * 
 * Features:
 * - Real-time connectivity status
 * - Auto-sync when coming back online
 * - Offline-first utilities
 * - Login streak tracking
 */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { t, language: preferredLanguage } = useLanguage();
  const { isOnline, getOfflineAuthData } = useOfflineAuth();
  const [offlineSession, setOfflineSession] = useState(false);
  
  const offlineData = getOfflineAuthData();
  
  const { streakCount, streakBroken, isOnline: streakOnline } = useLoginStreak(
    user?.email || offlineData?.email,
    profile?.full_name || offlineData?.name || 'Student'
  );

  useEffect(() => {
    const isOfflineSession = localStorage.getItem('offlineSessionActive') === 'true';
    setOfflineSession(isOfflineSession && !isOnline);
  }, [isOnline]);

  useEffect(() => {
    if (!authLoading && !user) {
      const isOfflineSession = localStorage.getItem('offlineSessionActive') === 'true';
      const hasOfflineData = offlineData !== null;
      
      if (!isOnline && isOfflineSession && hasOfflineData) {
        setOfflineSession(true);
      } else if (isOnline || !hasOfflineData) {
        navigate('/auth?role=student');
      }
    }
  }, [user, authLoading, navigate, isOnline, offlineData]);

  useEffect(() => {
    if (isOnline && offlineSession) {
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

  const displayName = profile?.full_name || offlineData?.name || t('student');

  if (authLoading && !offlineSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Login Alert */}
      {offlineSession && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-warning/10 border-warning/30">
          <WifiOff className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            {preferredLanguage === 'hi' 
              ? 'ऑफलाइन मोड: सहेजी गई एक्सेस से लॉगिन'
              : 'Offline Mode: Using saved credentials'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Streak saved offline notice */}
      {!streakOnline && streakCount > 0 && !offlineSession && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning-foreground">
          {t('offlineStreakSaved')}
        </div>
      )}
      
      <OfflineModeBanner />
      <MissionBanner />

      {/* Header */}
      <DashboardHeader
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        title={t('studentLearningApp')}
        userName={displayName}
        roleLabel={t('student')}
        badges={
          <>
            {streakCount > 0 && (
              <Badge 
                variant="outline" 
                className="bg-success/10 text-success border-success/30 gap-1"
              >
                <Flame className="h-3 w-3 text-orange-500" />
                {streakCount} {streakCount > 1 ? 'days' : 'day'}
              </Badge>
            )}
          </>
        }
        actions={<ConnectionStatus />}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Streak broken notice */}
        {streakBroken && (
          <Alert className="border-warning/30 bg-warning/5">
            <Flame className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              {t('streakBroken')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Daily Tip */}
        <DailyTip />
        
        {/* Learning Hub Navigation */}
        <StudentLearningHub />
      </main>

      {/* Floating Chatbot */}
      <OfflineChatbot />
    </div>
  );
}
