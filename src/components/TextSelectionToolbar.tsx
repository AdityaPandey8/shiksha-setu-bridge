/**
 * TextSelectionToolbar Component
 * 
 * Floating toolbar that appears when text is selected.
 * Provides quick actions: Highlight, Underline, Add Doubt, Create Flashcard
 * 
 * Works 100% offline
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Highlighter, Underline, HelpCircle, Layers, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useStudyTools, HighlightColor } from '@/hooks/useStudyTools';
import { cn } from '@/lib/utils';

interface TextSelectionToolbarProps {
  contentId: string;
  contentType: 'content' | 'ebook';
  containerRef: React.RefObject<HTMLElement>;
  contentTitle?: string;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; bg: string; label: string }[] = [
  { color: 'yellow', bg: 'bg-yellow-300', label: 'Yellow' },
  { color: 'green', bg: 'bg-green-300', label: 'Green' },
  { color: 'blue', bg: 'bg-blue-300', label: 'Blue' },
];

export function TextSelectionToolbar({ 
  contentId, 
  contentType, 
  containerRef,
  contentTitle 
}: TextSelectionToolbarProps) {
  const { toast } = useToast();
  const {
    addHighlight,
    addUnderline,
    addDoubt,
    addFlashcard,
  } = useStudyTools({ contentId, contentType });

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  
  // Dialog states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [doubtDialogOpen, setDoubtDialogOpen] = useState(false);
  const [flashcardDialogOpen, setFlashcardDialogOpen] = useState(false);
  
  // Form states
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtNote, setDoubtNote] = useState('');
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');

  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setIsVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) {
      setIsVisible(false);
      return;
    }

    // Check if selection is within our container
    if (containerRef.current) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;
      
      if (!container.contains(range.commonAncestorContainer)) {
        setIsVisible(false);
        return;
      }

      // Calculate position
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      setPosition({
        x: rect.left + (rect.width / 2) - containerRect.left,
        y: rect.top - containerRect.top - 50,
      });

      setSelectedText(text);
      
      // Get text offsets (simplified - based on text content)
      const containerText = container.textContent || '';
      const startOffset = containerText.indexOf(text);
      const endOffset = startOffset + text.length;
      setSelectionRange({ start: startOffset, end: endOffset });
      
      setIsVisible(true);
    }
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [handleSelection]);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Don't close if clicking on dialogs
        const target = e.target as HTMLElement;
        if (target.closest('[role="dialog"]')) return;
        
        setIsVisible(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHighlight = async (color: HighlightColor) => {
    if (!selectionRange) return;
    
    await addHighlight(selectedText, color, selectionRange.start, selectionRange.end);
    toast({
      title: 'Text Highlighted',
      description: `${selectedText.slice(0, 30)}${selectedText.length > 30 ? '...' : ''}`,
    });
    setIsVisible(false);
    setShowColorPicker(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleUnderline = async () => {
    if (!selectionRange) return;
    
    await addUnderline(selectedText, selectionRange.start, selectionRange.end);
    toast({
      title: 'Text Underlined',
      description: `${selectedText.slice(0, 30)}${selectedText.length > 30 ? '...' : ''}`,
    });
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddDoubt = async () => {
    if (!doubtQuestion.trim()) {
      toast({
        variant: 'destructive',
        title: 'Question Required',
        description: 'Please enter your doubt or question.',
      });
      return;
    }

    await addDoubt(doubtQuestion, selectedText, doubtNote || undefined);
    toast({
      title: 'Doubt Saved',
      description: 'Your question has been saved.',
    });
    setDoubtDialogOpen(false);
    setDoubtQuestion('');
    setDoubtNote('');
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const handleCreateFlashcard = async () => {
    if (!flashcardFront.trim() || !flashcardBack.trim()) {
      toast({
        variant: 'destructive',
        title: 'Both Sides Required',
        description: 'Please fill in both front and back of the flashcard.',
      });
      return;
    }

    await addFlashcard(flashcardFront, flashcardBack, selectedText);
    toast({
      title: 'Flashcard Created',
      description: 'Added to your flashcard collection.',
    });
    setFlashcardDialogOpen(false);
    setFlashcardFront('');
    setFlashcardBack('');
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  };

  const openDoubtDialog = () => {
    setDoubtQuestion(`I don't understand: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? '...' : ''}"`);
    setDoubtDialogOpen(true);
  };

  const openFlashcardDialog = () => {
    setFlashcardFront(selectedText.slice(0, 200));
    setFlashcardDialogOpen(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Toolbar */}
      <div
        ref={toolbarRef}
        className="absolute z-50 flex items-center gap-1 bg-popover border rounded-lg shadow-lg p-1 animate-in fade-in-0 zoom-in-95"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Highlight with color picker */}
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4 text-yellow-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center">
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(({ color, bg, label }) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground transition-colors",
                    bg
                  )}
                  title={label}
                  onClick={() => handleHighlight(color)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Underline */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Underline"
          onClick={handleUnderline}
        >
          <Underline className="h-4 w-4" />
        </Button>

        {/* Divider */}
        <div className="w-px h-4 bg-border" />

        {/* Add Doubt */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Add Doubt"
          onClick={openDoubtDialog}
        >
          <HelpCircle className="h-4 w-4 text-orange-500" />
        </Button>

        {/* Create Flashcard */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Create Flashcard"
          onClick={openFlashcardDialog}
        >
          <Layers className="h-4 w-4 text-purple-500" />
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Close"
          onClick={() => {
            setIsVisible(false);
            window.getSelection()?.removeAllRanges();
          }}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Doubt Dialog */}
      <Dialog open={doubtDialogOpen} onOpenChange={setDoubtDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-500" />
              Add Doubt
            </DialogTitle>
            <DialogDescription>
              Save your question for later review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Question / Doubt *</Label>
              <Textarea
                value={doubtQuestion}
                onChange={(e) => setDoubtQuestion(e.target.value)}
                placeholder="What didn't you understand?"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Note (optional)</Label>
              <Input
                value={doubtNote}
                onChange={(e) => setDoubtNote(e.target.value)}
                placeholder="Any additional context..."
              />
            </div>
            {selectedText && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Selected text:</p>
                <p className="text-sm line-clamp-3">"{selectedText}"</p>
              </div>
            )}
            <Button onClick={handleAddDoubt} className="w-full">
              Save Doubt
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flashcard Dialog */}
      <Dialog open={flashcardDialogOpen} onOpenChange={setFlashcardDialogOpen}>
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
            {contentTitle && (
              <p className="text-xs text-muted-foreground">
                From: {contentTitle}
              </p>
            )}
            <Button onClick={handleCreateFlashcard} className="w-full">
              Create Flashcard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
