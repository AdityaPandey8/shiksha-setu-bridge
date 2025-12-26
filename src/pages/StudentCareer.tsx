/**
 * StudentCareer Page
 * 
 * Dedicated page for career guidance with offline-first functionality.
 * 
 * OFFLINE BEHAVIOR:
 * - Career data is preloaded in CareerGuidance component
 * - Works 100% offline with local JSON data
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { CareerGuidance } from '@/components/CareerGuidance';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function StudentCareer() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth?role=student');
    return null;
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
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('hubCareer')}</h1>
                <p className="text-sm text-muted-foreground">{t('hubCareerDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <CareerGuidance />
      </main>
    </div>
  );
}
