/**
 * InteractiveTextViewer Component
 * 
 * Renders text content with interactive study tools:
 * - Applied highlights (yellow, green, blue)
 * - Applied underlines
 * - Text selection toolbar
 * 
 * Works 100% offline
 */

import { useRef, useMemo, useCallback } from 'react';
import { useStudyTools } from '@/hooks/useStudyTools';
import { TextSelectionToolbar } from '@/components/TextSelectionToolbar';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface InteractiveTextViewerProps {
  contentId: string;
  contentType: 'content' | 'ebook';
  content: string;
  contentTitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

const HIGHLIGHT_BG_COLORS = {
  yellow: 'bg-yellow-200/70 dark:bg-yellow-400/30',
  green: 'bg-green-200/70 dark:bg-green-400/30',
  blue: 'bg-blue-200/70 dark:bg-blue-400/30',
};

export function InteractiveTextViewer({
  contentId,
  contentType,
  content,
  contentTitle,
  className,
  style,
}: InteractiveTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const {
    highlights,
    underlines,
    removeHighlight,
    removeUnderline,
  } = useStudyTools({ contentId, contentType });

  // Render content with highlights and underlines applied
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Create a combined list of annotations sorted by start offset
    const annotations = [
      ...highlights.map(h => ({ 
        ...h, 
        type: 'highlight' as const,
        color: h.color 
      })),
      ...underlines.map(u => ({ 
        ...u, 
        type: 'underline' as const 
      })),
    ].sort((a, b) => a.startOffset - b.startOffset);

    if (annotations.length === 0) {
      // No annotations, render plain text with HTML support
      return (
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
        />
      );
    }

    // Build segments with annotations
    const segments: Array<{
      text: string;
      highlight?: { id: string; color: 'yellow' | 'green' | 'blue' };
      underline?: { id: string };
    }> = [];

    let lastEnd = 0;

    // Process content and find matching annotations
    annotations.forEach(annotation => {
      const start = annotation.startOffset;
      const end = annotation.endOffset;

      // Skip if annotation is before our current position
      if (end <= lastEnd) return;

      // Add plain text before this annotation
      if (start > lastEnd) {
        segments.push({ text: content.slice(lastEnd, start) });
      }

      // Add annotated text
      const annotatedText = content.slice(Math.max(start, lastEnd), end);
      const existingSegmentIndex = segments.findIndex(
        s => s.text === annotatedText && (s.highlight || s.underline)
      );

      if (existingSegmentIndex === -1) {
        segments.push({
          text: annotatedText,
          highlight: annotation.type === 'highlight' 
            ? { id: annotation.id, color: annotation.color! }
            : undefined,
          underline: annotation.type === 'underline'
            ? { id: annotation.id }
            : undefined,
        });
      }

      lastEnd = end;
    });

    // Add remaining text
    if (lastEnd < content.length) {
      segments.push({ text: content.slice(lastEnd) });
    }

    return segments.map((segment, index) => {
      const hasHighlight = segment.highlight;
      const hasUnderline = segment.underline;

      if (!hasHighlight && !hasUnderline) {
        return (
          <span 
            key={index}
            dangerouslySetInnerHTML={{ __html: segment.text.replace(/\n/g, '<br />') }}
          />
        );
      }

      return (
        <span
          key={index}
          className={cn(
            'relative group cursor-pointer transition-all',
            hasHighlight && HIGHLIGHT_BG_COLORS[hasHighlight.color],
            hasUnderline && 'underline decoration-2 decoration-foreground/50'
          )}
          title="Click to remove"
          onClick={() => {
            if (hasHighlight) {
              removeHighlight(hasHighlight.id);
              toast({ title: 'Highlight removed' });
            } else if (hasUnderline) {
              removeUnderline(hasUnderline.id);
              toast({ title: 'Underline removed' });
            }
          }}
        >
          {segment.text}
          {/* Remove indicator on hover */}
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
            <Trash2 className="h-3 w-3" />
            Remove
          </span>
        </span>
      );
    });
  }, [content, highlights, underlines, removeHighlight, removeUnderline, toast]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn("text-foreground leading-relaxed", className)}
        style={style}
      >
        {renderedContent}
      </div>
      
      <TextSelectionToolbar
        contentId={contentId}
        contentType={contentType}
        containerRef={containerRef as React.RefObject<HTMLElement>}
        contentTitle={contentTitle}
      />
    </div>
  );
}
