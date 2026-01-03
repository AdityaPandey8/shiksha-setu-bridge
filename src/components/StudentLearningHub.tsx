/**
 * StudentLearningHub Component
 * 
 * This component displays 4 main learning path navigation cards:
 * - E-Books: Structured curriculum for offline reading
 * - Learning Content: Videos, PDFs, notes
 * - Quizzes: Practice and self-evaluation
 * - Career Guidance: Explore future paths
 * 
 * OFFLINE-FIRST BEHAVIOR:
 * - Each card shows a green dot if data is cached locally
 * - Grey dot indicates "Download First" needed
 * - Works on low-end Android devices with large touch targets
 */

import { useNavigate } from 'react-router-dom';
import { BookOpen, FolderOpen, FileQuestion, GraduationCap, Circle, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

// Storage keys for checking offline availability
const CACHE_KEYS = {
  ebooks: 'shiksha_setu_ebooks',
  content: 'shiksha_setu_content',
  quizzes: 'shiksha_setu_quizzes',
  career: 'shiksha_setu_career_data',
  saarthi: 'shiksha_setu_saarthi', // Always available offline
};

interface LearningPathCard {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  subtitleKey: string;
  route: string;
  cacheKey: string;
  bgColor: string;
  iconColor: string;
}

export function StudentLearningHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if data is cached for offline use
  // Setu Saarthi is always considered available offline
  const isCached = (key: string): boolean => {
    if (key === CACHE_KEYS.saarthi) return true; // Always works offline
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
      icon: <Bot className="h-8 w-8" />,
      titleKey: 'hubSaarthi',
      subtitleKey: 'hubSaarthiDesc',
      route: '/student/setu-saarthi',
      cacheKey: CACHE_KEYS.saarthi,
      bgColor: 'bg-violet-500/10 dark:bg-violet-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      id: 'ebooks',
      icon: <BookOpen className="h-8 w-8" />,
      titleKey: 'hubEbooks',
      subtitleKey: 'hubEbooksDesc',
      route: '/student/ebooks',
      cacheKey: CACHE_KEYS.ebooks,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'content',
      icon: <FolderOpen className="h-8 w-8" />,
      titleKey: 'hubContent',
      subtitleKey: 'hubContentDesc',
      route: '/student/content',
      cacheKey: CACHE_KEYS.content,
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'quizzes',
      icon: <FileQuestion className="h-8 w-8" />,
      titleKey: 'hubQuizzes',
      subtitleKey: 'hubQuizzesDesc',
      route: '/student/quizzes',
      cacheKey: CACHE_KEYS.quizzes,
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      id: 'career',
      icon: <GraduationCap className="h-8 w-8" />,
      titleKey: 'hubCareer',
      subtitleKey: 'hubCareerDesc',
      route: '/student/career',
      cacheKey: CACHE_KEYS.career,
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="mb-6">
      {/* Section Title */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {t('chooseLearningPath')}
      </h2>

      {/* 2x2 Grid of Learning Path Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {learningPaths.map((path) => {
          const isAvailableOffline = isCached(path.cacheKey);
          
          return (
            <Card
              key={path.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/50"
              onClick={() => navigate(path.route)}
            >
              <CardContent className="p-4 md:p-5">
                {/* Icon Container */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${path.bgColor} flex items-center justify-center mb-3`}>
                  <span className={path.iconColor}>{path.icon}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">
                  {path.id === 'saarthi' && 'Setu Saarthi'}
                  {path.id === 'ebooks' && t('hubEbooks')}
                  {path.id === 'content' && t('hubContent')}
                  {path.id === 'quizzes' && t('hubQuizzes')}
                  {path.id === 'career' && t('hubCareer')}
                </h3>

                {/* Subtitle */}
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                  {path.id === 'saarthi' && 'Ask doubts & get guidance'}
                  {path.id === 'ebooks' && t('hubEbooksDesc')}
                  {path.id === 'content' && t('hubContentDesc')}
                  {path.id === 'quizzes' && t('hubQuizzesDesc')}
                  {path.id === 'career' && t('hubCareerDesc')}
                </p>

                {/* Offline Status Indicator */}
                <div className="flex items-center gap-1.5">
                  <Circle
                    className={`h-2.5 w-2.5 ${
                      isAvailableOffline
                        ? 'fill-green-500 text-green-500'
                        : 'fill-muted text-muted'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isAvailableOffline ? t('availableOffline') : t('downloadFirst')}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
