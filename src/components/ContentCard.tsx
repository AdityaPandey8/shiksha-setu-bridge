/**
 * ContentCard Component
 * 
 * Displays learning content (videos, PDFs, articles, images) in a clean card format.
 * Supports offline download with progress indicators.
 * Full-screen viewing for distraction-free learning.
 */

import { useNavigate } from 'react-router-dom';
import { 
  Video, FileText, File, ExternalLink, Maximize2, 
  Download, Check, Loader2, RefreshCw, WifiOff, Image as ImageIcon 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useContentStorage } from '@/hooks/useContentStorage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  contentType: 'video' | 'article' | 'pdf' | 'image';
  language: 'hindi' | 'english';
  articleBody?: string | null;
  imageUrl?: string | null;
  version?: number;
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

export function ContentCard({
  id,
  title,
  description,
  url,
  contentType,
  language,
  articleBody,
  imageUrl,
  version = 1,
}: ContentCardProps) {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { 
    isContentCached, 
    hasUpdate, 
    downloadContent, 
    downloadProgress 
  } = useContentStorage();
  
  const Icon = contentTypeIcons[contentType];
  const isCached = isContentCached(id);
  const hasNewVersion = hasUpdate(id, version);
  const progress = downloadProgress[id];
  const canDownload = contentType !== 'video';

  const handleOpenFullScreen = () => {
    navigate(`/student/content/${id}`);
  };

  const handleDownload = async () => {
    await downloadContent({
      id,
      title,
      description: description ?? null,
      url: url ?? null,
      content_type: contentType,
      class: '', // Will be filled by server data
      language,
      article_body: articleBody,
      image_url: imageUrl,
      version,
    });
  };

  const getDownloadButtonContent = () => {
    if (progress?.status === 'downloading') {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Downloading...
        </>
      );
    }
    if (isCached && hasNewVersion) {
      return (
        <>
          <RefreshCw className="h-4 w-4" />
          Update Available
        </>
      );
    }
    if (isCached) {
      return (
        <>
          <Check className="h-4 w-4" />
          Downloaded
        </>
      );
    }
    return (
      <>
        <Download className="h-4 w-4" />
        Download for Offline
      </>
    );
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              contentType === 'video' && 'bg-primary/10 text-primary',
              contentType === 'article' && 'bg-accent/10 text-accent',
              contentType === 'pdf' && 'bg-secondary/10 text-secondary',
              contentType === 'image' && 'bg-emerald-500/10 text-emerald-600'
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-xs">
              {contentTypeLabels[contentType]}
            </Badge>
            {isCached && (
              <Badge variant="secondary" className="text-xs gap-1">
                {hasNewVersion ? (
                  <RefreshCw className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                {hasNewVersion ? 'Update' : 'Offline'}
              </Badge>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs capitalize"
          >
            {language}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3 leading-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Download Progress */}
        {progress?.status === 'downloading' && (
          <Progress value={progress.progress} className="h-2 mb-2" />
        )}

        {/* Full Screen Button - Primary Action */}
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2"
          onClick={handleOpenFullScreen}
          disabled={!isOnline && !isCached && contentType !== 'video'}
        >
          {!isOnline && !isCached ? (
            <>
              <WifiOff className="h-4 w-4" />
              Download to View Offline
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              Open Full Screen
            </>
          )}
        </Button>

        {/* Download Button - For offline support */}
        {canDownload && isOnline && (
          <Button
            variant={isCached && !hasNewVersion ? "secondary" : "outline"}
            size="sm"
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={progress?.status === 'downloading' || (isCached && !hasNewVersion)}
          >
            {getDownloadButtonContent()}
          </Button>
        )}
        
        {/* External Link - Secondary Action */}
        {url && contentType !== 'image' && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open External Link
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
