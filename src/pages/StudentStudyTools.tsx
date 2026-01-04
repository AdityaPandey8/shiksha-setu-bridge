/**
 * StudentStudyTools Page
 * 
 * Full-page view for managing offline study tools:
 * - Bookmarks
 * - Doubt Notes
 * - Flashcards
 * 
 * All data stored in localStorage - works 100% offline
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  HelpCircle, 
  Layers, 
  Trash2, 
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  Edit,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOfflineUtilities, Bookmark as BookmarkType, DoubtNote, Flashcard } from '@/hooks/useOfflineUtilities';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function StudentStudyTools() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    bookmarks, 
    doubts, 
    flashcards,
    removeBookmark,
    removeDoubt,
    resolveDoubt,
    removeFlashcard,
    updateFlashcard,
  } = useOfflineUtilities();

  const [activeTab, setActiveTab] = useState('bookmarks');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<DoubtNote | null>(null);
  const [answerText, setAnswerText] = useState('');
  
  // Flashcard practice state
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/auth?role=student');
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleResolveDoubt = () => {
    if (selectedDoubt) {
      resolveDoubt(selectedDoubt.id, answerText || undefined);
      toast({
        title: 'Doubt Resolved',
        description: 'Great job finding the answer!',
      });
      setResolveDialogOpen(false);
      setSelectedDoubt(null);
      setAnswerText('');
    }
  };

  const unresolvedDoubts = doubts.filter(d => !d.resolved);
  const resolvedDoubts = doubts.filter(d => d.resolved);

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
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Layers className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">My Study Tools</h1>
                <p className="text-sm text-muted-foreground">Bookmarks, Notes & Flashcards</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-blue-500/10 border-blue-200">
            <CardContent className="p-4 text-center">
              <Bookmark className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{bookmarks.length}</p>
              <p className="text-xs text-muted-foreground">Bookmarks</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-200">
            <CardContent className="p-4 text-center">
              <HelpCircle className="h-6 w-6 mx-auto mb-1 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{doubts.length}</p>
              <p className="text-xs text-muted-foreground">Doubts</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-200">
            <CardContent className="p-4 text-center">
              <Layers className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{flashcards.length}</p>
              <p className="text-xs text-muted-foreground">Flashcards</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="bookmarks" className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Bookmarks</span>
            </TabsTrigger>
            <TabsTrigger value="doubts" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Doubts</span>
              {unresolvedDoubts.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {unresolvedDoubts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {bookmarks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-medium mb-1">No Bookmarks Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookmark important content while reading E-Books.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {bookmark.type}
                            </Badge>
                            {bookmark.data?.pageNumber && (
                              <Badge variant="secondary" className="text-xs">
                                Page {bookmark.data.pageNumber as number}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm truncate">{bookmark.title}</h4>
                          {bookmark.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {bookmark.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(bookmark.createdAt)}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Bookmark</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this bookmark?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeBookmark(bookmark.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Doubts Tab */}
          <TabsContent value="doubts">
            {doubts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-medium mb-1">No Doubt Notes Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Save your questions while studying to ask later.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Unresolved Doubts */}
                {unresolvedDoubts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Pending ({unresolvedDoubts.length})
                    </h3>
                    <div className="space-y-3">
                      {unresolvedDoubts.map((doubt) => (
                        <Card key={doubt.id} className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{doubt.question}</p>
                                {doubt.context && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Context: {doubt.context}
                                  </p>
                                )}
                                {doubt.subject && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    {doubt.subject}
                                  </Badge>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDate(doubt.createdAt)}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDoubt(doubt);
                                    setResolveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Doubt</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this doubt?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => removeDoubt(doubt.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Doubts */}
                {resolvedDoubts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Resolved ({resolvedDoubts.length})
                    </h3>
                    <div className="space-y-3">
                      {resolvedDoubts.map((doubt) => (
                        <Card key={doubt.id} className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-xs text-green-600 font-medium">Resolved</span>
                                </div>
                                <p className="font-medium text-sm">{doubt.question}</p>
                                {doubt.answer && (
                                  <p className="text-sm text-muted-foreground mt-2 p-2 bg-background rounded">
                                    <strong>Answer:</strong> {doubt.answer}
                                  </p>
                                )}
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Doubt</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this resolved doubt?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeDoubt(doubt.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            {flashcards.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-medium mb-1">No Flashcards Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create flashcards while studying for quick revision.
                  </p>
                </CardContent>
              </Card>
            ) : practiceMode ? (
              // Practice Mode
              <Card className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Practice Mode</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setPracticeMode(false)}>
                      Exit
                    </Button>
                  </div>
                  <CardDescription>
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Card 
                    className="w-full max-w-md min-h-[200px] cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center">
                      {!showAnswer ? (
                        <>
                          <p className="text-lg font-medium mb-4">{flashcards[currentCardIndex].front}</p>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Show Answer
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-lg">{flashcards[currentCardIndex].back}</p>
                          <Badge variant="secondary" className="mt-4">
                            {flashcards[currentCardIndex].difficulty}
                          </Badge>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
                        setShowAnswer(false);
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
                        setShowAnswer(false);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // List Mode
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => { setPracticeMode(true); setCurrentCardIndex(0); setShowAnswer(false); }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Practice All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {flashcards.map((card) => (
                    <Card key={card.id}>
                      <CardContent className="py-4 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{card.front}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{card.back}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  card.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' :
                                  card.difficulty === 'hard' ? 'bg-red-500/10 text-red-600' :
                                  ''
                                }`}
                              >
                                {card.difficulty}
                              </Badge>
                              {card.subject && (
                                <Badge variant="outline" className="text-xs">
                                  {card.subject}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive shrink-0">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this flashcard?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => removeFlashcard(card.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Resolve Doubt Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Doubt</DialogTitle>
            <DialogDescription>
              Found the answer? Write it down for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedDoubt?.question}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer (Optional)</label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write the answer or solution you found..."
                rows={3}
              />
            </div>
            <Button onClick={handleResolveDoubt} className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}