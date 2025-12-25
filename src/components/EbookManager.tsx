import { useState } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronUp, Trash2, Edit, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEbookStorage, Ebook, Chapter } from '@/hooks/useEbookStorage';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

/**
 * EbookManager Component
 * 
 * Teacher/Admin interface for managing E-Books and chapters.
 * Features:
 * - Add/Edit/Delete E-Books
 * - Add/Edit/Delete chapters within E-Books
 * - Offline-first data storage
 */
export function EbookManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    ebooks,
    addEbook,
    updateEbook,
    deleteEbook,
    addChapter,
    updateChapter,
    deleteChapter,
  } = useEbookStorage();

  // E-Book form state
  const [ebookDialogOpen, setEbookDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookDescription, setEbookDescription] = useState('');
  const [ebookClass, setEbookClass] = useState('6');
  const [ebookLanguage, setEbookLanguage] = useState<'hindi' | 'english'>('english');
  const [ebookOfflineEnabled, setEbookOfflineEnabled] = useState(true);
  const [submittingEbook, setSubmittingEbook] = useState(false);

  // Chapter form state
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [selectedEbookId, setSelectedEbookId] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterActivities, setChapterActivities] = useState('');
  const [submittingChapter, setSubmittingChapter] = useState(false);

  // Expanded E-Books for viewing chapters
  const [expandedEbooks, setExpandedEbooks] = useState<Set<string>>(new Set());

  const resetEbookForm = () => {
    setEbookTitle('');
    setEbookDescription('');
    setEbookClass('6');
    setEbookLanguage('english');
    setEbookOfflineEnabled(true);
    setEditingEbook(null);
  };

  const resetChapterForm = () => {
    setChapterTitle('');
    setChapterContent('');
    setChapterActivities('');
    setEditingChapter(null);
    setSelectedEbookId(null);
  };

  const handleOpenEbookDialog = (ebook?: Ebook) => {
    if (ebook) {
      setEditingEbook(ebook);
      setEbookTitle(ebook.title);
      setEbookDescription(ebook.description);
      setEbookClass(ebook.class);
      setEbookLanguage(ebook.language);
      setEbookOfflineEnabled(ebook.offlineEnabled);
    } else {
      resetEbookForm();
    }
    setEbookDialogOpen(true);
  };

  const handleOpenChapterDialog = (ebookId: string, chapter?: Chapter) => {
    setSelectedEbookId(ebookId);
    if (chapter) {
      setEditingChapter(chapter);
      setChapterTitle(chapter.title);
      setChapterContent(chapter.content);
      setChapterActivities(chapter.activities.join('\n'));
    } else {
      resetChapterForm();
      setSelectedEbookId(ebookId);
    }
    setChapterDialogOpen(true);
  };

  const handleSubmitEbook = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEbook(true);

    try {
      if (editingEbook) {
        updateEbook(editingEbook.id, {
          title: ebookTitle,
          description: ebookDescription,
          class: ebookClass,
          language: ebookLanguage,
          offlineEnabled: ebookOfflineEnabled,
        });
        toast({
          title: t('ebookUpdated'),
          description: t('ebookUpdatedDesc'),
        });
      } else {
        addEbook({
          title: ebookTitle,
          description: ebookDescription,
          class: ebookClass,
          language: ebookLanguage,
          offlineEnabled: ebookOfflineEnabled,
          chapters: [],
        });
        toast({
          title: t('ebookAdded'),
          description: t('ebookAddedDesc'),
        });
      }
      setEbookDialogOpen(false);
      resetEbookForm();
    } catch (error) {
      console.error('Error saving E-Book:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to save E-Book.',
      });
    } finally {
      setSubmittingEbook(false);
    }
  };

  const handleSubmitChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEbookId) return;
    setSubmittingChapter(true);

    try {
      const activities = chapterActivities
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      if (editingChapter) {
        updateChapter(selectedEbookId, editingChapter.id, {
          title: chapterTitle,
          content: chapterContent,
          activities,
        });
        toast({
          title: t('chapterUpdated'),
          description: t('chapterUpdatedDesc'),
        });
      } else {
        addChapter(selectedEbookId, {
          title: chapterTitle,
          content: chapterContent,
          activities,
        });
        toast({
          title: t('chapterAdded'),
          description: t('chapterAddedDesc'),
        });
      }
      setChapterDialogOpen(false);
      resetChapterForm();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to save chapter.',
      });
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteEbook = (ebookId: string) => {
    deleteEbook(ebookId);
    toast({
      title: t('ebookDeleted'),
      description: t('ebookDeletedDesc'),
    });
  };

  const handleDeleteChapter = (ebookId: string, chapterId: string) => {
    deleteChapter(ebookId, chapterId);
    toast({
      title: t('chapterDeleted'),
      description: t('chapterDeletedDesc'),
    });
  };

  const toggleExpanded = (ebookId: string) => {
    setExpandedEbooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ebookId)) {
        newSet.delete(ebookId);
      } else {
        newSet.add(ebookId);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('ebooks')}
            </CardTitle>
            <CardDescription>{t('manageEbooksDesc')}</CardDescription>
          </div>
          <Dialog open={ebookDialogOpen} onOpenChange={setEbookDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenEbookDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addEbook')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingEbook ? t('editEbook') : t('addNewEbook')}
                </DialogTitle>
                <DialogDescription>
                  {t('createEbookMaterial')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitEbook} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ebookTitle">{t('bookTitle')}</Label>
                  <Input
                    id="ebookTitle"
                    value={ebookTitle}
                    onChange={(e) => setEbookTitle(e.target.value)}
                    placeholder={t('enterBookTitle')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebookDescription">{t('description')}</Label>
                  <Textarea
                    id="ebookDescription"
                    value={ebookDescription}
                    onChange={(e) => setEbookDescription(e.target.value)}
                    placeholder={t('enterDescription')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('class')}</Label>
                    <Select value={ebookClass} onValueChange={setEbookClass}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">{t('class6')}</SelectItem>
                        <SelectItem value="7">{t('class7')}</SelectItem>
                        <SelectItem value="8">{t('class8')}</SelectItem>
                        <SelectItem value="9">{t('class9')}</SelectItem>
                        <SelectItem value="10">{t('class10')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('language')}</Label>
                    <Select value={ebookLanguage} onValueChange={(v) => setEbookLanguage(v as 'hindi' | 'english')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">{t('english')}</SelectItem>
                        <SelectItem value="hindi">{t('hindi')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="offlineEnabled">{t('offlineDownloadEnabled')}</Label>
                  <Switch
                    id="offlineEnabled"
                    checked={ebookOfflineEnabled}
                    onCheckedChange={setEbookOfflineEnabled}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submittingEbook}>
                  {submittingEbook && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submittingEbook ? t('saving') : (editingEbook ? t('updateEbook') : t('addEbook'))}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {ebooks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('noEbooksDesc')}
          </p>
        ) : (
          <div className="space-y-4">
            {ebooks.map((ebook) => {
              const isExpanded = expandedEbooks.has(ebook.id);
              return (
                <Collapsible key={ebook.id} open={isExpanded}>
                  <Card className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger 
                          className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                          onClick={() => toggleExpanded(ebook.id)}
                        >
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{ebook.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{t('class')} {ebook.class}</Badge>
                              <Badge variant="secondary">
                                {ebook.language === 'hindi' ? t('hindi') : t('english')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {ebook.chapters.length} {t('chapters')}
                              </Badge>
                              {ebook.offlineEnabled && (
                                <Badge className="bg-green-500/10 text-green-600 border-green-200">
                                  {t('offlineEnabled')}
                                </Badge>
                              )}
                            </CardDescription>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEbookDialog(ebook)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('deleteEbook')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('deleteEbookConfirm')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEbook(ebook.id)}>
                                  {t('delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {ebook.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {ebook.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">{t('chapters')}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChapterDialog(ebook.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {t('addChapter')}
                          </Button>
                        </div>
                        {ebook.chapters.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {t('noChaptersYet')}
                          </p>
                        ) : (
                          <Accordion type="single" collapsible className="space-y-2">
                            {ebook.chapters
                              .sort((a, b) => a.order - b.order)
                              .map((chapter) => (
                                <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-lg px-3">
                                  <AccordionTrigger className="py-2 hover:no-underline">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{chapter.title}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-3 pb-2">
                                      <div className="text-sm text-muted-foreground line-clamp-3">
                                        {chapter.content.substring(0, 200)}...
                                      </div>
                                      {chapter.activities.length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          {chapter.activities.length} {t('activities')}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenChapterDialog(ebook.id, chapter)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          {t('edit')}
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-destructive">
                                              <Trash2 className="h-3 w-3 mr-1" />
                                              {t('delete')}
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>{t('deleteChapter')}</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {t('deleteChapterConfirm')}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteChapter(ebook.id, chapter.id)}>
                                                {t('delete')}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                          </Accordion>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Chapter Dialog */}
        <Dialog open={chapterDialogOpen} onOpenChange={setChapterDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChapter ? t('editChapter') : t('addNewChapter')}
              </DialogTitle>
              <DialogDescription>
                {t('chapterOfflineNote')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitChapter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chapterTitle">{t('chapterTitle')}</Label>
                <Input
                  id="chapterTitle"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder={t('enterChapterTitle')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterContent">{t('chapterContent')}</Label>
                <Textarea
                  id="chapterContent"
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  placeholder={t('enterChapterContent')}
                  className="min-h-[200px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('supportsMarkdown')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterActivities">{t('activitiesQuestions')}</Label>
                <Textarea
                  id="chapterActivities"
                  value={chapterActivities}
                  onChange={(e) => setChapterActivities(e.target.value)}
                  placeholder={t('enterActivities')}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  {t('onePerLine')}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={submittingChapter}>
                {submittingChapter && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submittingChapter ? t('saving') : (editingChapter ? t('updateChapter') : t('addChapter'))}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
