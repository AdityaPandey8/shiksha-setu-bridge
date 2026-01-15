/**
 * ContentBookmarkButton Component
 * 
 * Bookmark button for Learning Content and E-Books.
 * Shows filled/unfilled state based on bookmark status.
 * 
 * Works 100% offline
 */

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useStudyTools } from '@/hooks/useStudyTools';
import { cn } from '@/lib/utils';

interface ContentBookmarkButtonProps {
  contentId: string;
  contentType: 'content' | 'ebook';
  title: string;
  pageNumber?: number;
  chapterId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ContentBookmarkButton({
  contentId,
  contentType,
  title,
  pageNumber,
  chapterId,
  variant = 'ghost',
  size = 'icon',
  className,
}: ContentBookmarkButtonProps) {
  const { toast } = useToast();
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useStudyTools({ 
    contentId, 
    contentType 
  });

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [note, setNote] = useState('');

  const bookmarked = isBookmarked();
  const existingBookmark = bookmarks[0]; // There's typically only one bookmark per content

  const handleToggleBookmark = async () => {
    if (bookmarked && existingBookmark) {
      await removeBookmark(existingBookmark.id);
      toast({
        title: 'Bookmark Removed',
        description: 'Removed from your bookmarks.',
      });
    } else {
      setPopoverOpen(true);
    }
  };

  const handleAddBookmark = async () => {
    await addBookmark(title, note || undefined, pageNumber, chapterId);
    toast({
      title: 'Bookmark Added',
      description: 'Saved to your offline bookmarks.',
    });
    setNote('');
    setPopoverOpen(false);
  };

  const handleQuickBookmark = async () => {
    await addBookmark(title, undefined, pageNumber, chapterId);
    toast({
      title: 'Bookmark Added',
      description: 'Saved to your offline bookmarks.',
    });
  };

  if (bookmarked) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(
          'text-primary hover:text-primary/80',
          className
        )}
        onClick={handleToggleBookmark}
        title="Remove Bookmark"
      >
        <BookmarkCheck className={cn(
          size === 'icon' ? 'h-5 w-5' : 'h-4 w-4 mr-2',
          'fill-current'
        )} />
        {size !== 'icon' && 'Bookmarked'}
      </Button>
    );
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          title="Add Bookmark"
          onClick={(e) => {
            // Quick bookmark on single click without popover
            if (!popoverOpen) {
              handleQuickBookmark();
              e.preventDefault();
            }
          }}
          onContextMenu={(e) => {
            // Right-click to add with note
            e.preventDefault();
            setPopoverOpen(true);
          }}
        >
          <Bookmark className={cn(
            size === 'icon' ? 'h-5 w-5' : 'h-4 w-4 mr-2'
          )} />
          {size !== 'icon' && 'Bookmark'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Add Bookmark</h4>
          <div className="space-y-2">
            <Label className="text-xs">Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setPopoverOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleAddBookmark}
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
