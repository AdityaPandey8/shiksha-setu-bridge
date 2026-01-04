import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, HelpCircle, BarChart3, Plus, Trash2, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { MissionBanner } from '@/components/MissionBanner';
import { OnlineIndicator } from '@/components/OfflineBanner';
import { EbookManager } from '@/components/EbookManager';
import { EbookPdfManager } from '@/components/EbookPdfManager';
import { useEbookStorage } from '@/hooks/useEbookStorage';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf';
  class: string;
  language: 'hindi' | 'english';
  created_at: string;
}

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  class: string;
  language: 'hindi' | 'english';
  created_at: string;
}

interface ProgressDetail {
  content_id: string;
  content_title: string;
  completed: boolean;
  completed_at: string | null;
}

interface QuizScoreDetail {
  quiz_id: string;
  quiz_question: string;
  score: number;
  total_questions: number;
  attempted_at: string;
}

interface StudentProgress {
  id: string;
  email: string;
  full_name: string | null;
  class: string | null;
  completed_count: number;
  quiz_score: number;
  total_quizzes: number;
  progressDetails: ProgressDetail[];
  quizScoreDetails: QuizScoreDetail[];
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, signOut, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { ebooks } = useEbookStorage();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Content form
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'article' | 'pdf'>('article');
  const [contentClass, setContentClass] = useState('8');
  const [contentLanguage, setContentLanguage] = useState<'hindi' | 'english'>('hindi');
  const [contentUrl, setContentUrl] = useState('');
  const [submittingContent, setSubmittingContent] = useState(false);

  // Quiz form
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0);
  const [quizClass, setQuizClass] = useState('8');
  const [quizLanguage, setQuizLanguage] = useState<'hindi' | 'english'>('hindi');
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Redirect if not logged in or not teacher
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?role=teacher');
      } else if (role && role !== 'teacher') {
        navigate('/student');
      }
    }
  }, [user, role, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch content
      const { data: contentData } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentData) {
        setContent(contentData as ContentItem[]);
      }

      // Fetch quizzes
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (quizzesData) {
        const formattedQuizzes = quizzesData.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        })) as QuizItem[];
        setQuizzes(formattedQuizzes);
      }

      // Fetch student progress
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name, class');

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const studentUserIds = rolesData
        ?.filter(r => r.role === 'student')
        .map(r => r.user_id) || [];

      const studentProfiles = profilesData?.filter(p => studentUserIds.includes(p.id)) || [];

      // Fetch progress and scores for each student
      const studentsWithProgress: StudentProgress[] = [];

      for (const profile of studentProfiles) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('content_id, completed, completed_at')
          .eq('user_id', profile.id);

        const { data: scoresData } = await supabase
          .from('quiz_scores')
          .select('quiz_id, score, total_questions, attempted_at')
          .eq('user_id', profile.id);

        // Map progress to content titles
        const progressDetails: ProgressDetail[] = (progressData || []).map(p => {
          const contentItem = contentData?.find(c => c.id === p.content_id);
          return {
            content_id: p.content_id,
            content_title: contentItem?.title || 'Unknown Content',
            completed: p.completed || false,
            completed_at: p.completed_at,
          };
        });

        // Map quiz scores to quiz questions
        const quizScoreDetails: QuizScoreDetail[] = (scoresData || []).map(s => {
          const quizItem = quizzesData?.find(q => q.id === s.quiz_id);
          return {
            quiz_id: s.quiz_id,
            quiz_question: quizItem?.question || 'Unknown Quiz',
            score: s.score,
            total_questions: s.total_questions,
            attempted_at: s.attempted_at,
          };
        });

        studentsWithProgress.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          class: profile.class,
          completed_count: progressDetails.filter(p => p.completed).length,
          quiz_score: scoresData?.reduce((acc, s) => acc + s.score, 0) || 0,
          total_quizzes: scoresData?.length || 0,
          progressDetails,
          quizScoreDetails,
        });
      }

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && role === 'teacher') {
      fetchData();
    }
  }, [user, role, fetchData]);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContent(true);

    try {
      const { error } = await supabase.from('content').insert({
        title: contentTitle,
        description: contentDescription || null,
        url: contentUrl || null,
        content_type: contentType,
        class: contentClass,
        language: contentLanguage,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: t('contentAdded'),
        description: t('contentAddedDesc'),
      });

      setContentDialogOpen(false);
      resetContentForm();
      fetchData();
    } catch (error) {
      console.error('Error adding content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add content.',
      });
    } finally {
      setSubmittingContent(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: t('deleteContent'),
        description: t('deleteContentConfirm'),
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete content.',
      });
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingQuiz(true);

    try {
      const { error } = await supabase.from('quizzes').insert({
        question: quizQuestion,
        options: quizOptions,
        correct_answer: quizCorrectAnswer,
        class: quizClass,
        language: quizLanguage,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: t('quizAdded'),
        description: t('quizAddedDesc'),
      });

      setQuizDialogOpen(false);
      resetQuizForm();
      fetchData();
    } catch (error) {
      console.error('Error adding quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add quiz.',
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: t('deleteQuiz'),
        description: t('deleteQuizConfirm'),
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete quiz.',
      });
    }
  };

  const resetContentForm = () => {
    setContentTitle('');
    setContentDescription('');
    setContentUrl('');
    setContentType('article');
    setContentClass('8');
    setContentLanguage('hindi');
  };

  const resetQuizForm = () => {
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer(0);
    setQuizClass('8');
    setQuizLanguage('hindi');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const toggleStudentExpanded = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MissionBanner />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-lg font-bold">{t('teacherDashboard')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('manageContentQuizzesProgress')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <OnlineIndicator />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('totalContent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{content.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('totalEbooks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{ebooks.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('totalQuizzes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{quizzes.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('totalStudents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                <span className="text-2xl font-bold">{students.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="content">{t('content')}</TabsTrigger>
            <TabsTrigger value="ebooks">{t('ebooks')}</TabsTrigger>
            <TabsTrigger value="quizzes">{t('quizzes')}</TabsTrigger>
            <TabsTrigger value="students">{t('students')}</TabsTrigger>
          </TabsList>

          {/* E-Books Tab */}
          <TabsContent value="ebooks" className="space-y-6">
            <EbookPdfManager />
            <EbookManager />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('learningContent')}</CardTitle>
                  <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addContent')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('addNewContent')}</DialogTitle>
                        <DialogDescription>
                          {t('createLearningMaterial')}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddContent} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">{t('title')}</Label>
                          <Input
                            id="title"
                            value={contentTitle}
                            onChange={(e) => setContentTitle(e.target.value)}
                            placeholder={t('title')}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">{t('description')}</Label>
                          <Textarea
                            id="description"
                            value={contentDescription}
                            onChange={(e) => setContentDescription(e.target.value)}
                            placeholder={t('description')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="url">{t('contentUrl')}</Label>
                          <Input
                            id="url"
                            type="url"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="https://example.com/resource"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('contentType')}</Label>
                            <Select value={contentType} onValueChange={(v) => setContentType(v as 'video' | 'article' | 'pdf')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">{t('video')}</SelectItem>
                                <SelectItem value="article">{t('article')}</SelectItem>
                                <SelectItem value="pdf">{t('pdf')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('class')}</Label>
                            <Select value={contentClass} onValueChange={setContentClass}>
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
                        </div>
                        <div className="space-y-2">
                          <Label>{t('language')}</Label>
                          <Select value={contentLanguage} onValueChange={(v) => setContentLanguage(v as 'hindi' | 'english')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hindi">{t('hindi')}</SelectItem>
                              <SelectItem value="english">{t('english')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={submittingContent}>
                          {submittingContent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {submittingContent ? t('adding') : t('addContent')}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {content.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('noContentDesc')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('title')}</TableHead>
                        <TableHead>{t('contentType')}</TableHead>
                        <TableHead>{t('class')}</TableHead>
                        <TableHead>{t('language')}</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {content.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.content_type === 'video' ? t('video') : item.content_type === 'article' ? t('article') : t('pdf')}
                            </Badge>
                          </TableCell>
                          <TableCell>{t('class')} {item.class}</TableCell>
                          <TableCell className="capitalize">{item.language === 'hindi' ? t('hindi') : t('english')}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('deleteContent')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('deleteContentConfirm')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteContent(item.id)}>
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('quizzes')}</CardTitle>
                  <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addQuiz')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t('addNewQuiz')}</DialogTitle>
                        <DialogDescription>
                          {t('createQuiz')}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddQuiz} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question">{t('question')}</Label>
                          <Textarea
                            id="question"
                            value={quizQuestion}
                            onChange={(e) => setQuizQuestion(e.target.value)}
                            placeholder={t('enterQuestion')}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('options')}</Label>
                          {quizOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...quizOptions];
                                  newOptions[index] = e.target.value;
                                  setQuizOptions(newOptions);
                                }}
                                placeholder={`${t('options')} ${index + 1}`}
                                required
                              />
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={quizCorrectAnswer === index}
                                onChange={() => setQuizCorrectAnswer(index)}
                                className="h-4 w-4"
                              />
                              <span className="text-xs text-muted-foreground">{t('correct')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('class')}</Label>
                            <Select value={quizClass} onValueChange={setQuizClass}>
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
                            <Select value={quizLanguage} onValueChange={(v) => setQuizLanguage(v as 'hindi' | 'english')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hindi">{t('hindi')}</SelectItem>
                                <SelectItem value="english">{t('english')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={submittingQuiz}>
                          {submittingQuiz && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {submittingQuiz ? t('adding') : t('addQuiz')}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {quizzes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('noQuizzesDesc')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('question')}</TableHead>
                        <TableHead>{t('class')}</TableHead>
                        <TableHead>{t('language')}</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {quiz.question}
                          </TableCell>
                          <TableCell>{t('class')} {quiz.class}</TableCell>
                          <TableCell className="capitalize">{quiz.language === 'hindi' ? t('hindi') : t('english')}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('deleteQuiz')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('deleteQuizConfirm')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>{t('studentProgress')}</CardTitle>
                <CardDescription>
                  {t('manageContentQuizzesProgress')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t('noStudentsDesc')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => {
                      const isExpanded = expandedStudents.has(student.id);
                      const progressPercent = content.length > 0 
                        ? (student.completed_count / content.length) * 100 
                        : 0;
                      const quizPercent = student.total_quizzes > 0 
                        ? (student.quiz_score / student.total_quizzes) * 100 
                        : 0;
                      
                      return (
                        <Collapsible key={student.id} open={isExpanded} onOpenChange={() => toggleStudentExpanded(student.id)}>
                          <Card className="border">
                            <CollapsibleTrigger className="w-full">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-left">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-base">
                                        {student.full_name || t('student')}
                                      </CardTitle>
                                      <CardDescription className="text-sm">
                                        {student.email} • {t('class')} {student.class || '-'}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                      <Badge variant="secondary" className="mr-2">
                                        {student.completed_count} / {content.length} {t('lessons')}
                                      </Badge>
                                      <Badge variant={student.quiz_score > 0 ? 'default' : 'outline'}>
                                        {student.quiz_score} / {student.total_quizzes} {t('correct')}
                                      </Badge>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0 space-y-6">
                                {/* Progress Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{t('lessonsCompleted')}</span>
                                      <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{t('quizAccuracy')}</span>
                                      <span className="font-medium">{quizPercent.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={quizPercent} className="h-2" />
                                  </div>
                                </div>

                                {/* Completed Lessons */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    {t('completedLessons')} ({student.progressDetails.filter(p => p.completed).length})
                                  </h4>
                                  {student.progressDetails.filter(p => p.completed).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('noLessonsCompleted')}</p>
                                  ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {student.progressDetails.filter(p => p.completed).map((p) => (
                                        <div key={p.content_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">{p.content_title}</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDate(p.completed_at)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Quiz Responses */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-accent" />
                                    {t('quizResponses')} ({student.quizScoreDetails.length})
                                  </h4>
                                  {student.quizScoreDetails.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t('noQuizAttempts')}</p>
                                  ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {student.quizScoreDetails.map((q, index) => (
                                        <div key={`${q.quiz_id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {q.score > 0 ? (
                                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            ) : (
                                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                            )}
                                            <span className="text-sm truncate">{q.quiz_question}</span>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <Badge variant={q.score > 0 ? 'default' : 'destructive'} className="text-xs">
                                              {q.score > 0 ? t('correct') : t('incorrect')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground hidden sm:block">
                                              {formatDate(q.attempted_at)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
