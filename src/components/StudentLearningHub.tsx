/**
 * StudentLearningHub Component
 * 
 * Professional grid of learning path navigation cards.
 * Each card shows offline availability status.
 * Designed for accessibility on mobile devices.
 */

import { useNavigate } from 'react-router-dom';
import { BookOpen, FolderOpen, FileQuestion, GraduationCap, Bot, Layers, ArrowRight, Download, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const CACHE_KEYS = {
  ebooks: 'shiksha_setu_ebooks',
  content: 'shiksha_setu_content',
  quizzes: 'shiksha_setu_quizzes',
  career: 'shiksha_setu_career_data',
  saarthi: 'shiksha_setu_saarthi',
  studyTools: 'shiksha_setu_bookmarks',
};

interface LearningPathCard {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  route: string;
  cacheKey: string;
  gradient: string;
}

export function StudentLearningHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const isCached = (key: string): boolean => {
    if (key === CACHE_KEYS.saarthi || key === CACHE_KEYS.studyTools) return true;
    try {
      const data = localStorage.getItem(key);
      return data !== null && data !== '[]' && data !== '{}';
    } catch {
      return false;
    }
  };

  const learningPaths: LearningPathCard[] = [
    {
      id: 'saarthi',
      icon: Bot,
      title: 'Setu Saarthi',
      subtitle: 'Ask doubts & get guidance',
      route: '/student/setu-saarthi',
      cacheKey: CACHE_KEYS.saarthi,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      id: 'studytools',
      icon: Layers,
      title: 'My Study Tools',
      subtitle: 'Bookmarks, Notes & Flashcards',
      route: '/student/study-tools',
      cacheKey: CACHE_KEYS.studyTools,
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      id: 'ebooks',
      icon: BookOpen,
      title: t('hubEbooks'),
      subtitle: t('hubEbooksDesc'),
      route: '/student/ebooks',
      cacheKey: CACHE_KEYS.ebooks,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'content',
      icon: FolderOpen,
      title: t('hubContent'),
      subtitle: t('hubContentDesc'),
      route: '/student/content',
      cacheKey: CACHE_KEYS.content,
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      id: 'quizzes',
      icon: FileQuestion,
      title: t('hubQuizzes'),
      subtitle: t('hubQuizzesDesc'),
      route: '/student/quizzes',
      cacheKey: CACHE_KEYS.quizzes,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      id: 'career',
      icon: GraduationCap,
      title: t('hubCareer'),
      subtitle: t('hubCareerDesc'),
      route: '/student/career',
      cacheKey: CACHE_KEYS.career,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('chooseLearningPath')}
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {learningPaths.map((path, index) => {
          const isAvailableOffline = isCached(path.cacheKey);
          const Icon = path.icon;
          
          return (
            <Card
              key={path.id}
              className={cn(
                "group cursor-pointer card-hover border-0 shadow-soft overflow-hidden animate-fade-in",
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(path.route)}
            >
              <CardContent className="p-0">
                {/* Gradient Header */}
                <div className={cn(
                  "h-20 md:h-24 bg-gradient-to-br flex items-center justify-center relative",
                  path.gradient
                )}>
                  <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  
                  {/* Arrow indicator on hover */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-white/80" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-1">
                    {path.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                    {path.subtitle}
                  </p>

                  {/* Offline Status */}
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    isAvailableOffline ? "text-success" : "text-muted-foreground"
                  )}>
                    {isAvailableOffline ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{t('availableOffline')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>{t('downloadFirst')}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
