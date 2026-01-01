import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { MissionBanner } from '@/components/MissionBanner';
import { OfflineModeBanner, ConnectionStatus } from '@/components/ConnectionStatus';
import { StudentLearningHub } from '@/components/StudentLearningHub';
import { OfflineChatbot } from '@/components/OfflineChatbot';
import { OfflineUtilitiesPanel } from '@/components/OfflineUtilitiesPanel';

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
 */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?role=student');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                <h1 className="text-lg font-bold">{t('studentLearningApp')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('welcome')}, {profile?.full_name || t('student')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Real-time Connectivity Status */}
              <ConnectionStatus />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Learning Hub Navigation Cards + Offline Utilities */}
      <main className="container mx-auto px-4 py-8">
        {/* Daily Motivational Tip */}
        <OfflineUtilitiesPanel />
        
        {/* Learning Path Selection Cards */}
        <StudentLearningHub />
      </main>

      {/* Floating Offline Chatbot */}
      <OfflineChatbot />
    </div>
  );
}
