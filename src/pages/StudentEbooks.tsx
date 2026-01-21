/**
 * StudentEbooks Page
 * 
 * Dedicated page for viewing E-Books with offline-first functionality.
 * E-Books are filtered based on student's selected subjects.
 * 
 * OFFLINE BEHAVIOR:
 * - Loads data from localStorage first
 * - Silently syncs with backend when online
 * - Shows cached data without errors when offline
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useStudentSubjects } from '@/hooks/useStudentSubjects';
import { EbookViewer } from '@/components/EbookViewer';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SubjectPromptBanner } from '@/components/SubjectPromptBanner';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StudentEbooks() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { hasSelectedSubjects, loading: subjectsLoading } = useStudentSubjects();

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth?role=student');
    return null;
  }

  if (authLoading || subjectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />

      {/* Header with Back Navigation */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Subject Prompt Banner */}
        {!hasSelectedSubjects && (
          <SubjectPromptBanner />
        )}

        {/* Show message if no subjects selected */}
        {!hasSelectedSubjects ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'hi' 
                  ? 'ई-बुक्स देखने के लिए अपने विषय चुनें'
                  : 'Select your subjects to see E-Books'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <EbookViewer />
        )}
      </main>
    </div>
  );
}
