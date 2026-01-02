/**
 * ContentCard Component
 * 
 * Displays learning content (videos, PDFs, articles) in a clean card format.
 * Content is always accessible and reusable - no completion tracking.
 */

import { Video, FileText, File, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContentCardProps {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  contentType: 'video' | 'article' | 'pdf';
  language: 'hindi' | 'english';
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

export function ContentCard({
  id,
  title,
  description,
  url,
  contentType,
  language,
}: ContentCardProps) {
  const Icon = contentTypeIcons[contentType];

  return (
    <Card className="transition-all duration-300 hover:shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              contentType === 'video' 
                ? 'bg-primary/10 text-primary' 
                : contentType === 'article'
                ? 'bg-accent/10 text-accent'
                : 'bg-secondary/10 text-secondary'
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-xs">
              {contentTypeLabels[contentType]}
            </Badge>
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
      <CardContent>
        {url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Resource
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
