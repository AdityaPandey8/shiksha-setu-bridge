import { useState, useEffect } from 'react';
import { BookOpen, Download, CheckCircle2, ChevronLeft, FileText, Lightbulb, Wifi, WifiOff, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEbookStorage, Ebook, Chapter } from '@/hooks/useEbookStorage';
import { useLanguage } from '@/hooks/useLanguage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/hooks/use-toast';
import { StudyToolsFloating } from '@/components/StudyToolsFloating';
import { supabase } from '@/integrations/supabase/client';

interface PdfEbook {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  class: string;
  language: 'hindi' | 'english';
  pdf_url: string;
  pdf_filename: string | null;
  offline_enabled: boolean;
}

/**
 * EbookViewer Component
 * 
 * Student interface for viewing and reading E-Books.
 * Features:
 * - Download E-Books for offline use
 * - Read chapters with activities
 * - Track reading progress
 * - 100% offline functionality after download
 * - Study tools: Bookmarks, Doubt Notes, Flashcards
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
  
  // PDF E-Books from database
  const [pdfEbooks, setPdfEbooks] = useState<PdfEbook[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [downloadedPdfIds, setDownloadedPdfIds] = useState<string[]>([]);
  const [selectedPdfEbook, setSelectedPdfEbook] = useState<PdfEbook | null>(null);

  // Load PDF e-books from database and localStorage
  useEffect(() => {
    const fetchPdfEbooks = async () => {
      try {
        // Load from localStorage first (offline-first)
        const cached = localStorage.getItem('shiksha_setu_pdf_ebooks');
        if (cached) {
          setPdfEbooks(JSON.parse(cached));
        }
        
        const downloaded = localStorage.getItem('shiksha_setu_downloaded_pdf_ids');
        if (downloaded) {
          setDownloadedPdfIds(JSON.parse(downloaded));
        }

        // Fetch from database if online
        if (isOnline) {
          const { data, error } = await supabase
            .from('ebooks')
            .select('*')
            .order('created_at', { ascending: false });

          if (data && !error) {
            setPdfEbooks(data);
            localStorage.setItem('shiksha_setu_pdf_ebooks', JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error('Error fetching PDF ebooks:', error);
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchPdfEbooks();
  }, [isOnline]);

  const handleDownloadPdf = (pdfEbook: PdfEbook) => {
    if (!downloadedPdfIds.includes(pdfEbook.id)) {
      const newDownloaded = [...downloadedPdfIds, pdfEbook.id];
      setDownloadedPdfIds(newDownloaded);
      localStorage.setItem('shiksha_setu_downloaded_pdf_ids', JSON.stringify(newDownloaded));
      toast({
        title: t('ebookDownloaded'),
        description: 'PDF marked for offline access.',
      });
    }
  };

  const isPdfDownloaded = (id: string) => downloadedPdfIds.includes(id);

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

  // PDF Viewer
  if (selectedPdfEbook) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPdfEbook(null)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('back')}
              </Button>
              <div className="flex-1">
                <CardTitle className="text-lg">{selectedPdfEbook.title}</CardTitle>
                <CardDescription>{selectedPdfEbook.subject} • Class {selectedPdfEbook.class}</CardDescription>
              </div>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => window.open(selectedPdfEbook.pdf_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedPdfEbook.description && (
              <p className="text-sm text-muted-foreground mb-4">{selectedPdfEbook.description}</p>
            )}
            <div className="aspect-[3/4] md:aspect-video w-full rounded-lg overflow-hidden border bg-muted">
              <iframe
                src={`${selectedPdfEbook.pdf_url}#toolbar=1`}
                className="w-full h-full"
                title={selectedPdfEbook.title}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Study Tools Floating Buttons */}
        <StudyToolsFloating 
          context={{
            type: 'ebook',
            title: selectedPdfEbook.title,
            ebookId: selectedPdfEbook.id,
            ebookTitle: selectedPdfEbook.title,
          }}
        />
      </>
    );
  }

  // Chapter reading view
  if (selectedChapter && selectedEbook) {
    const isCompleted = isChapterCompleted(selectedEbook.id, selectedChapter.id);

    return (
      <>
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
        
        {/* Study Tools Floating Buttons */}
        <StudyToolsFloating 
          context={{
            type: 'ebook',
            title: selectedChapter.title,
            chapterId: selectedChapter.id,
            chapterTitle: selectedChapter.title,
            ebookId: selectedEbook.id,
            ebookTitle: selectedEbook.title,
          }}
        />
      </>
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

        {/* PDF E-Books Section */}
        {pdfEbooks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF Books ({pdfEbooks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {pdfEbooks.map((pdfEbook) => {
                const pdfDownloaded = isPdfDownloaded(pdfEbook.id);
                return (
                  <Card 
                    key={pdfEbook.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      pdfDownloaded ? 'border-green-200' : ''
                    }`}
                    onClick={() => setSelectedPdfEbook(pdfEbook)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{pdfEbook.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {pdfEbook.subject}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Class {pdfEbook.class}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {pdfEbook.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {pdfEbook.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {pdfDownloaded ? (
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
                              handleDownloadPdf(pdfEbook);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {t('download')}
                          </Button>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          PDF
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Chapter-based E-Books */}
        {ebooks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Interactive Books ({ebooks.length})
            </h3>
          </div>
        )}

        {ebooks.length === 0 && pdfEbooks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {loadingPdf ? (
              <><Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading E-Books...</>
            ) : (
              t('noEbooksAvailable')
            )}
          </p>
        ) : ebooks.length === 0 ? null : (
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
