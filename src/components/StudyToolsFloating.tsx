/**
 * StudyToolsFloating Component
 * 
 * Floating action buttons for offline study tools:
 * - Bookmark current page/content
 * - Add a doubt note
 * - Create a flashcard
 * 
 * Works 100% offline - all data stored in localStorage
 */

import { useState } from 'react';
import { Bookmark, HelpCircle, Layers, Plus, X, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useOfflineUtilities, Bookmark as BookmarkType } from '@/hooks/useOfflineUtilities';

interface StudyToolsFloatingProps {
  context: {
    type: 'ebook' | 'content' | 'quiz' | 'career';
    title: string;
    pageNumber?: number;
    chapterId?: string;
    chapterTitle?: string;
    ebookId?: string;
    ebookTitle?: string;
  };
}

export function StudyToolsFloating({ context }: StudyToolsFloatingProps) {
  const { toast } = useToast();
  const { addBookmark, addDoubt, addFlashcard, isBookmarked, removeBookmark, bookmarks } = useOfflineUtilities();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'bookmark' | 'doubt' | 'flashcard' | null>(null);
  
  // Form states
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtContext, setDoubtContext] = useState('');
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');
  const [flashcardDifficulty, setFlashcardDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const currentlyBookmarked = isBookmarked(context.type, context.title);
  
  const handleAddBookmark = () => {
    if (currentlyBookmarked) {
      // Find and remove bookmark
      const existing = bookmarks.find(b => b.type === context.type && b.title === context.title);
      if (existing) {
        removeBookmark(existing.id);
        toast({
          title: 'Bookmark Removed',
          description: 'Content removed from your bookmarks.',
        });
      }
    } else {
      addBookmark({
        type: context.type,
        title: context.title,
        description: bookmarkNote || `From ${context.ebookTitle || context.title}`,
        data: {
          pageNumber: context.pageNumber,
          chapterId: context.chapterId,
          chapterTitle: context.chapterTitle,
          ebookId: context.ebookId,
        },
      });
      toast({
        title: 'Bookmark Added',
        description: 'Saved to your offline bookmarks.',
      });
    }
    setActiveDialog(null);
    setBookmarkNote('');
    setIsOpen(false);
  };

  const handleAddDoubt = () => {
    if (!doubtQuestion.trim()) {
      toast({
        variant: 'destructive',
        title: 'Question Required',
        description: 'Please enter your doubt or question.',
      });
      return;
    }

    addDoubt({
      question: doubtQuestion,
      context: doubtContext || `${context.title}${context.chapterTitle ? ` - ${context.chapterTitle}` : ''}`,
      subject: context.ebookTitle || context.title,
    });

    toast({
      title: 'Doubt Saved',
      description: 'Your question has been saved for later.',
    });

    setActiveDialog(null);
    setDoubtQuestion('');
    setDoubtContext('');
    setIsOpen(false);
  };

  const handleAddFlashcard = () => {
    if (!flashcardFront.trim() || !flashcardBack.trim()) {
      toast({
        variant: 'destructive',
        title: 'Both Sides Required',
        description: 'Please fill in both front and back of the flashcard.',
      });
      return;
    }

    addFlashcard({
      front: flashcardFront,
      back: flashcardBack,
      subject: context.ebookTitle || context.title,
      difficulty: flashcardDifficulty,
    });

    toast({
      title: 'Flashcard Created',
      description: 'Added to your flashcard collection.',
    });

    setActiveDialog(null);
    setFlashcardFront('');
    setFlashcardBack('');
    setFlashcardDifficulty('medium');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button Group */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-2">
        {isOpen && (
          <>
            {/* Flashcard Button */}
            <Button
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => setActiveDialog('flashcard')}
            >
              <Layers className="h-5 w-5" />
            </Button>

            {/* Doubt Note Button */}
            <Button
              size="icon"
              variant="secondary"
              className="h-12 w-12 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setActiveDialog('doubt')}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* Bookmark Button */}
            <Button
              size="icon"
              variant="secondary"
              className={`h-12 w-12 rounded-full shadow-lg ${
                currentlyBookmarked 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              onClick={handleAddBookmark}
            >
              {currentlyBookmarked ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </>
        )}

        {/* Main Toggle Button */}
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg transition-transform ${
            isOpen ? 'rotate-45 bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Doubt Note Dialog */}
      <Dialog open={activeDialog === 'doubt'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              Add Doubt Note
            </DialogTitle>
            <DialogDescription>
              Write your question or doubt to review later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Question / Doubt *</Label>
              <Textarea
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                placeholder="What didn't you understand? Write your doubt here..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Context</Label>
              <Input
                value={doubtContext}
                onChange={(e) => setDoubtContext(e.target.value)}
                placeholder="Page number, topic, or any reference"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              From: {context.title}{context.chapterTitle ? ` - ${context.chapterTitle}` : ''}
            </p>
            <Button onClick={handleAddDoubt} className="w-full">
              Save Doubt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flashcard Dialog */}
      <Dialog open={activeDialog === 'flashcard'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              Create Flashcard
            </DialogTitle>
            <DialogDescription>
              Create a flashcard for quick revision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Front (Question / Term) *</Label>
              <Textarea
                value={flashcardFront}
                onChange={(e) => setFlashcardFront(e.target.value)}
                placeholder="Write the question or term..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Back (Answer / Explanation) *</Label>
              <Textarea
                value={flashcardBack}
                onChange={(e) => setFlashcardBack(e.target.value)}
                placeholder="Write the answer or explanation..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={flashcardDifficulty} onValueChange={(v) => setFlashcardDifficulty(v as 'easy' | 'medium' | 'hard')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddFlashcard} className="w-full">
              Create Flashcard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}