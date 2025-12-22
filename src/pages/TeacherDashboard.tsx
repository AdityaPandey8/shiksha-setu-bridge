import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, HelpCircle, BarChart3, Plus, Trash2, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MissionBanner } from '@/components/MissionBanner';
import { OnlineIndicator } from '@/components/OfflineBanner';

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

interface StudentProgress {
  id: string;
  email: string;
  full_name: string | null;
  class: string | null;
  completed_count: number;
  quiz_score: number;
  total_quizzes: number;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, signOut, loading: authLoading } = useAuth();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
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
          .select('completed')
          .eq('user_id', profile.id)
          .eq('completed', true);

        const { data: scoresData } = await supabase
          .from('quiz_scores')
          .select('score')
          .eq('user_id', profile.id);

        studentsWithProgress.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          class: profile.class,
          completed_count: progressData?.length || 0,
          quiz_score: scoresData?.reduce((acc, s) => acc + s.score, 0) || 0,
          total_quizzes: scoresData?.length || 0,
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
        title: 'Content Added!',
        description: 'The content has been added successfully.',
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
        title: 'Content Deleted',
        description: 'The content has been removed.',
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
        title: 'Quiz Added!',
        description: 'The quiz has been added successfully.',
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
        title: 'Quiz Deleted',
        description: 'The quiz has been removed.',
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
                <h1 className="text-lg font-bold">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage content, quizzes, and track student progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <OnlineIndicator />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Content
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
                Total Quizzes
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
                Total Students
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
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Learning Content</CardTitle>
                  <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Content</DialogTitle>
                        <DialogDescription>
                          Create learning material for students
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddContent} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={contentTitle}
                            onChange={(e) => setContentTitle(e.target.value)}
                            placeholder="Enter content title"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (optional)</Label>
                          <Textarea
                            id="description"
                            value={contentDescription}
                            onChange={(e) => setContentDescription(e.target.value)}
                            placeholder="Enter description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="url">URL (optional)</Label>
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
                            <Label>Content Type</Label>
                            <Select value={contentType} onValueChange={(v) => setContentType(v as 'video' | 'article' | 'pdf')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="article">Article</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Class</Label>
                            <Select value={contentClass} onValueChange={setContentClass}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">Class 6</SelectItem>
                                <SelectItem value="7">Class 7</SelectItem>
                                <SelectItem value="8">Class 8</SelectItem>
                                <SelectItem value="9">Class 9</SelectItem>
                                <SelectItem value="10">Class 10</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select value={contentLanguage} onValueChange={(v) => setContentLanguage(v as 'hindi' | 'english')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hindi">Hindi</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full" disabled={submittingContent}>
                          {submittingContent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Content
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {content.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No content added yet. Click "Add Content" to create your first lesson.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {content.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.content_type}
                            </Badge>
                          </TableCell>
                          <TableCell>Class {item.class}</TableCell>
                          <TableCell className="capitalize">{item.language}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Content?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{item.title}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteContent(item.id)}>
                                    Delete
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
                  <CardTitle>Quizzes</CardTitle>
                  <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Quiz</DialogTitle>
                        <DialogDescription>
                          Create a multiple choice question
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddQuiz} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question">Question</Label>
                          <Textarea
                            id="question"
                            value={quizQuestion}
                            onChange={(e) => setQuizQuestion(e.target.value)}
                            placeholder="Enter your question"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {quizOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...quizOptions];
                                  newOptions[index] = e.target.value;
                                  setQuizOptions(newOptions);
                                }}
                                placeholder={`Option ${index + 1}`}
                                required
                              />
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={quizCorrectAnswer === index}
                                onChange={() => setQuizCorrectAnswer(index)}
                                className="h-4 w-4"
                              />
                              <span className="text-xs text-muted-foreground">Correct</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Class</Label>
                            <Select value={quizClass} onValueChange={setQuizClass}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">Class 6</SelectItem>
                                <SelectItem value="7">Class 7</SelectItem>
                                <SelectItem value="8">Class 8</SelectItem>
                                <SelectItem value="9">Class 9</SelectItem>
                                <SelectItem value="10">Class 10</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select value={quizLanguage} onValueChange={(v) => setQuizLanguage(v as 'hindi' | 'english')}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={submittingQuiz}>
                          {submittingQuiz && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Quiz
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {quizzes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No quizzes added yet. Click "Add Quiz" to create your first quiz.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {quiz.question}
                          </TableCell>
                          <TableCell>Class {quiz.class}</TableCell>
                          <TableCell className="capitalize">{quiz.language}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this quiz. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
                                    Delete
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
                <CardTitle>Student Progress</CardTitle>
                <CardDescription>
                  Track student learning progress and quiz scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No students registered yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Lessons Completed</TableHead>
                        <TableHead>Quiz Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>Class {student.class || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {student.completed_count} / {content.length}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.quiz_score > 0 ? 'default' : 'outline'}>
                              {student.quiz_score} / {student.total_quizzes}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
