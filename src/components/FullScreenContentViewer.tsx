/**
 * FullScreenContentViewer Component
 * 
 * A distraction-free, full-screen content viewing experience.
 * Supports videos, articles, PDFs, and images with responsive rendering.
 * Works offline if content is cached.
 */

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Video, FileText, File, Maximize2, WifiOff, ZoomIn, ZoomOut, Type, Image as ImageIcon, Download, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { textToHtml } from '@/lib/sanitize';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ContentData {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf' | 'image';
  class: string;
  language: 'hindi' | 'english';
  article_body?: string | null;
  image_url?: string | null;
  version?: number;
}

export interface CachedContentData {
  id: string;
  title: string;
  description?: string;
  url?: string;
  contentType: 'video' | 'article' | 'pdf' | 'image';
  class: string;
  language: 'hindi' | 'english';
  articleBody?: string;
  imageUrl?: string;
  imageBlob?: Blob;
  pdfBlob?: Blob;
  version: number;
}

interface FullScreenContentViewerProps {
  content: ContentData | null;
  cachedContent?: CachedContentData | null;
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
  image: ImageIcon,
};

const contentTypeLabels = {
  video: 'Video',
  article: 'Article',
  pdf: 'PDF',
  image: 'Image',
};

export function FullScreenContentViewer({
  content,
  cachedContent,
  loading,
  isOffline = false,
  isCached = false,
  backLabel,
  onBack,
}: FullScreenContentViewerProps) {
  const [fontSize, setFontSize] = useState(16);
  const [pdfScale, setPdfScale] = useState(100);
  const [imageScale, setImageScale] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Create blob URLs for cached content
  useEffect(() => {
    if (cachedContent?.imageBlob) {
      const url = URL.createObjectURL(cachedContent.imageBlob);
      setImageBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [cachedContent?.imageBlob]);

  useEffect(() => {
    if (cachedContent?.pdfBlob) {
      const url = URL.createObjectURL(cachedContent.pdfBlob);
      setPdfBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [cachedContent?.pdfBlob]);

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
              <p className="text-muted-foreground mb-4">
                Download this content to view offline. Go back and tap "Download for Offline" when connected to the internet.
              </p>
              <Button variant="outline" onClick={onBack} className="gap-2">
                <Download className="h-4 w-4" />
                Go Back to Download
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!content && !cachedContent) {
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

  // Merge content from server and cache
  const displayContent = {
    id: content?.id || cachedContent?.id || '',
    title: content?.title || cachedContent?.title || '',
    description: content?.description || cachedContent?.description || null,
    url: content?.url || cachedContent?.url || null,
    content_type: content?.content_type || cachedContent?.contentType || 'article',
    class: content?.class || cachedContent?.class || '',
    language: content?.language || cachedContent?.language || 'hindi',
    article_body: content?.article_body || cachedContent?.articleBody || null,
    image_url: content?.image_url || cachedContent?.imageUrl || null,
  };

  const Icon = contentTypeIcons[displayContent.content_type];

  const renderContent = () => {
    const contentType = displayContent.content_type;

    // Video - Online only
    if (contentType === 'video') {
      if (isOffline) {
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <WifiOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Video Unavailable Offline</h2>
              <p className="text-muted-foreground">
                Videos require an internet connection to stream. Please connect to the internet.
              </p>
            </CardContent>
          </Card>
        );
      }

      if (!displayContent.url) {
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Video URL</h2>
              <p className="text-muted-foreground">
                This video doesn't have an associated URL.
              </p>
            </CardContent>
          </Card>
        );
      }

      return (
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Check if it's a YouTube video */}
            {displayContent.url.includes('youtube.com') || displayContent.url.includes('youtu.be') ? (
              <iframe
                src={displayContent.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={displayContent.title}
              />
            ) : (
              <video
                src={displayContent.url}
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
    }

    // Image
    if (contentType === 'image') {
      const imageSource = imageBlobUrl || displayContent.image_url;

      if (!imageSource) {
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Image Available</h2>
              <p className="text-muted-foreground">
                This content doesn't have an image.
              </p>
            </CardContent>
          </Card>
        );
      }

      return (
        <div className="w-full max-w-5xl mx-auto flex flex-col">
          {/* Image Controls */}
          <div className="flex items-center justify-center gap-4 mb-4 px-4 flex-wrap">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[imageScale]}
                onValueChange={([value]) => setImageScale(value)}
                min={25}
                max={200}
                step={5}
                className="w-32"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm w-12 text-center">{imageScale}%</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              className="gap-1"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </Button>
          </div>
          
          <div className="flex-1 border rounded-lg overflow-auto bg-card shadow-lg p-4 flex items-center justify-center min-h-[60vh]">
            <img
              src={imageSource}
              alt={displayContent.title}
              className="max-w-full h-auto transition-transform duration-200"
              style={{ 
                transform: `scale(${imageScale / 100}) rotate(${imageRotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        </div>
      );
    }

    // Article
    if (contentType === 'article') {
      const articleContent = displayContent.article_body || displayContent.description;

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
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
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
                <h1 className="text-2xl md:text-3xl font-bold mb-6">{displayContent.title}</h1>
                {articleContent && (
                  <div 
                    className="text-foreground leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: textToHtml(articleContent) }}
                  />
                )}
                {displayContent.url && (
                  <div className="mt-6 pt-6 border-t">
                    <a 
                      href={displayContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      Open Original Article
                      <Maximize2 className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </article>
            </CardContent>
          </Card>
        </div>
      );
    }

    // PDF
    if (contentType === 'pdf') {
      const pdfSource = pdfBlobUrl || displayContent.url;

      if (!pdfSource) {
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <File className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No PDF Available</h2>
              <p className="text-muted-foreground">
                This content doesn't have a PDF file.
              </p>
            </CardContent>
          </Card>
        );
      }

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
              src={`${pdfSource}#zoom=${pdfScale}`}
              className="w-full h-full"
              title={displayContent.title}
              style={{ 
                transform: `scale(${pdfScale / 100})`, 
                transformOrigin: 'top left', 
                width: `${10000 / pdfScale}%`, 
                height: `${10000 / pdfScale}%` 
              }}
            />
          </div>
        </div>
      );
    }

    return null;
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
                {contentTypeLabels[displayContent.content_type]}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {displayContent.language}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content Title */}
      <div className="pt-16 pb-4 px-4 bg-muted/30 border-b">
        <div className="container mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-center">{displayContent.title}</h1>
          {displayContent.description && displayContent.content_type !== 'article' && (
            <p className="text-sm text-muted-foreground text-center mt-1 line-clamp-2">
              {displayContent.description}
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
