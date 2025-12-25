import { useState } from 'react';
import { BookOpen, Download, CheckCircle2, ChevronLeft, FileText, Lightbulb, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEbookStorage, Ebook, Chapter } from '@/hooks/useEbookStorage';
import { useLanguage } from '@/hooks/useLanguage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';

/**
 * EbookViewer Component
 * 
 * Student interface for viewing and reading E-Books.
 * Features:
 * - Download E-Books for offline use
 * - Read chapters with activities
 * - Track reading progress
 * - 100% offline functionality after download
 */
export function EbookViewer() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const {
    ebooks,
    downloadEbook,
    isDownloaded,
    markChapterComplete,
    getEbookProgress,
    getDownloadedEbooks,
  } = useEbookStorage();

  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const handleDownload = (ebookId: string) => {
    downloadEbook(ebookId);
    toast({
      title: t('ebookDownloaded'),
      description: t('ebookAvailableOffline'),
    });
  };

  const handleSelectEbook = (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setSelectedChapter(null);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleMarkComplete = (ebookId: string, chapterId: string) => {
    markChapterComplete(ebookId, chapterId);
    toast({
      title: t('chapterCompleted'),
      description: t('progressSaved'),
    });
  };

  const handleBack = () => {
    if (selectedChapter) {
      setSelectedChapter(null);
    } else {
      setSelectedEbook(null);
    }
  };

  const getProgressPercent = (ebook: Ebook) => {
    const progress = getEbookProgress(ebook.id);
    const completedCount = progress.filter(p => p.completed).length;
    return ebook.chapters.length > 0 
      ? (completedCount / ebook.chapters.length) * 100 
      : 0;
  };

  const isChapterCompleted = (ebookId: string, chapterId: string) => {
    const progress = getEbookProgress(ebookId);
    return progress.some(p => p.chapterId === chapterId && p.completed);
  };

  // Chapter reading view
  if (selectedChapter && selectedEbook) {
    const isCompleted = isChapterCompleted(selectedEbook.id, selectedChapter.id);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('back')}
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg">{selectedChapter.title}</CardTitle>
              <CardDescription>{selectedEbook.title}</CardDescription>
            </div>
            {!isCompleted && (
              <Button 
                size="sm"
                onClick={() => handleMarkComplete(selectedEbook.id, selectedChapter.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('markComplete')}
              </Button>
            )}
            {isCompleted && (
              <Badge className="bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t('completed')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chapter Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {selectedChapter.content}
            </div>
          </div>

          {/* Activities */}
          {selectedChapter.activities.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  {t('practiceActivities')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {selectedChapter.activities.map((activity, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="font-medium text-primary">{index + 1}.</span>
                      <span className="text-sm">{activity}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  }

  // E-Book detail view (chapter list)
  if (selectedEbook) {
    const progressPercent = getProgressPercent(selectedEbook);
    const progress = getEbookProgress(selectedEbook.id);
    const completedCount = progress.filter(p => p.completed).length;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('back')}
            </Button>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {selectedEbook.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{t('class')} {selectedEbook.class}</Badge>
                <Badge variant="secondary">
                  {selectedEbook.language === 'hindi' ? t('hindi') : t('english')}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{t('yourProgress')}</span>
              <span>{completedCount} / {selectedEbook.chapters.length} {t('chapters')}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {selectedEbook.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {selectedEbook.description}
            </p>
          )}
          
          {selectedEbook.chapters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t('noChaptersAvailable')}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEbook.chapters
                .sort((a, b) => a.order - b.order)
                .map((chapter) => {
                  const completed = isChapterCompleted(selectedEbook.id, chapter.id);
                  return (
                    <Card 
                      key={chapter.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        completed ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : ''
                      }`}
                      onClick={() => handleSelectChapter(chapter)}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              completed ? 'bg-green-500/10' : 'bg-muted'
                            }`}>
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{chapter.title}</p>
                              {chapter.activities.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {chapter.activities.length} {t('activities')}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // E-Book list view
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('myEbooks')}
            </CardTitle>
            <CardDescription>{t('myEbooksDesc')}</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={isOnline 
              ? 'bg-green-500/10 text-green-600 border-green-200' 
              : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
            }
          >
            {isOnline ? (
              <><Wifi className="h-3 w-3 mr-1" /> {t('online')}</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> {t('offline')}</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t('downloadOnceUseAnytime')}
        </p>

        {ebooks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('noEbooksAvailable')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ebooks.map((ebook) => {
              const downloaded = isDownloaded(ebook.id);
              const progressPercent = getProgressPercent(ebook);

              return (
                <Card 
                  key={ebook.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    downloaded ? 'border-green-200' : ''
                  }`}
                  onClick={() => handleSelectEbook(ebook)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{ebook.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {t('class')} {ebook.class}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {ebook.language === 'hindi' ? t('hindi') : t('english')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {ebook.description || `${ebook.chapters.length} ${t('chapters')}`}
                    </p>
                    
                    {downloaded && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t('progress')}</span>
                          <span>{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {downloaded ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('availableOffline')}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(ebook.id);
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          {t('download')}
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {ebook.chapters.length} {t('chapters')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
