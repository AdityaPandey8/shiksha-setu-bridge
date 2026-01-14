/**
 * FullScreenContentViewer Component
 * 
 * A distraction-free, full-screen content viewing experience.
 * Supports videos, articles, and PDFs with responsive rendering.
 * Works offline if content is cached.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Video, FileText, File, Maximize2, WifiOff, ZoomIn, ZoomOut, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ContentData {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf';
  class: string;
  language: 'hindi' | 'english';
}

interface FullScreenContentViewerProps {
  content: ContentData | null;
  loading: boolean;
  isOffline?: boolean;
  isCached?: boolean;
  backLabel: string;
  backPath: string;
  onBack: () => void;
}

const contentTypeIcons = {
  video: Video,
  article: FileText,
  pdf: File,
};

const contentTypeLabels = {
  video: 'Video',
  article: 'Article',
  pdf: 'PDF',
};

export function FullScreenContentViewer({
  content,
  loading,
  isOffline = false,
  isCached = false,
  backLabel,
  onBack,
}: FullScreenContentViewerProps) {
  const [fontSize, setFontSize] = useState(16);
  const [pdfScale, setPdfScale] = useState(100);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Maximize2 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  // Offline without cache
  if (isOffline && !isCached && !content) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Back Button */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center pt-16">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Content Not Available Offline</h2>
              <p className="text-muted-foreground">
                This content is not cached for offline viewing. Please connect to the internet to access it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center pt-16">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Content Not Found</h2>
              <p className="text-muted-foreground">
                The requested content could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const Icon = contentTypeIcons[content.content_type];

  const renderContent = () => {
    if (!content.url) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Content URL</h2>
            <p className="text-muted-foreground">
              This content doesn't have an associated URL.
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (content.content_type) {
      case 'video':
        return (
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              {/* Check if it's a YouTube video */}
              {content.url.includes('youtube.com') || content.url.includes('youtu.be') ? (
                <iframe
                  src={content.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={content.title}
                />
              ) : (
                <video
                  src={content.url}
                  className="absolute inset-0 w-full h-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          </div>
        );

      case 'article':
        return (
          <div className="w-full max-w-3xl mx-auto">
            {/* Font Size Controls */}
            <div className="flex items-center justify-end gap-4 mb-4 px-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Font Size</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  <span className="text-xs">A-</span>
                </Button>
                <span className="text-sm w-8 text-center">{fontSize}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                >
                  <span className="text-xs">A+</span>
                </Button>
              </div>
            </div>
            
            <Card className="shadow-lg">
              <CardContent className="p-6 md:p-10">
                <article 
                  className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <h1 className="text-2xl md:text-3xl font-bold mb-6">{content.title}</h1>
                  {content.description && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {content.description}
                    </p>
                  )}
                  <div className="mt-6 pt-6 border-t">
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      Open Original Article
                      <Maximize2 className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              </CardContent>
            </Card>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
            {/* Zoom Controls */}
            <div className="flex items-center justify-end gap-4 mb-4 px-4">
              <div className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[pdfScale]}
                  onValueChange={([value]) => setPdfScale(value)}
                  min={50}
                  max={200}
                  step={10}
                  className="w-32"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm w-12 text-center">{pdfScale}%</span>
              </div>
            </div>
            
            <div className="flex-1 border rounded-lg overflow-hidden bg-card shadow-lg">
              <iframe
                src={`${content.url}#zoom=${pdfScale}`}
                className="w-full h-full"
                title={content.title}
                style={{ transform: `scale(${pdfScale / 100})`, transformOrigin: 'top left', width: `${10000 / pdfScale}%`, height: `${10000 / pdfScale}%` }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-2">
              {isOffline && (
                <Badge variant="secondary" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Icon className="h-3 w-3" />
                {contentTypeLabels[content.content_type]}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {content.language}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content Title */}
      <div className="pt-16 pb-4 px-4 bg-muted/30 border-b">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-center">{content.title}</h1>
          {content.description && content.content_type !== 'article' && (
            <p className="text-sm text-muted-foreground text-center mt-1 line-clamp-2">
              {content.description}
            </p>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
}
