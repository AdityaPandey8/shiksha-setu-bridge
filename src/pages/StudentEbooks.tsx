/**
 * StudentEbooks Page
 * 
 * Dedicated page for viewing E-Books with offline-first functionality.
 * 
 * OFFLINE BEHAVIOR:
 * - Loads data from localStorage first
 * - Silently syncs with backend when online
 * - Shows cached data without errors when offline
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { EbookViewer } from '@/components/EbookViewer';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function StudentEbooks() {
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

      {/* Header with Back Navigation */}
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
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('hubEbooks')}</h1>
                <p className="text-sm text-muted-foreground">{t('hubEbooksDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <EbookViewer />
      </main>
    </div>
  );
}
