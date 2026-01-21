/**
 * FullScreenContentEditor Component
 * 
 * A full-screen, focused editor for teachers to add/edit learning content.
 * Features:
 * - Distraction-free full-screen mode
 * - Auto-save drafts to localStorage
 * - Subject restriction based on teacher allocation
 * - Professional UX with clear navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Loader2, FileText, Video, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useTeacherAllocation } from '@/hooks/useTeacherAllocation';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { ContentFileUpload } from '@/components/ContentFileUpload';

interface ContentData {
  id?: string;
  title: string;
  description: string;
  content_type: 'video' | 'article' | 'pdf' | 'image';
  class: string;
  language: 'hindi' | 'english';
  subject: string;
  url: string;
  article_body: string;
  image_url: string;
}

interface FullScreenContentEditorProps {
  editingContent?: ContentData | null;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
}

const DRAFT_KEY = 'shiksha_setu_content_draft';

export function FullScreenContentEditor({
  editingContent,
  onClose,
  onSaved,
  userId,
}: FullScreenContentEditorProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { allocation, loading: allocationLoading } = useTeacherAllocation();
  const { activeSubjects, getSubjectLabel } = useSubjects();

  const [content, setContent] = useState<ContentData>({
    title: '',
    description: '',
    content_type: 'article',
    class: '',
    language: 'hindi',
    subject: '',
    url: '',
    article_body: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Initialize from editing content or draft
  useEffect(() => {
    if (editingContent) {
      setContent(editingContent);
    } else {
      // Load draft
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          setContent(JSON.parse(draft));
        } catch { /* ignore */ }
      }
    }
  }, [editingContent]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (editingContent) return; // Don't auto-save when editing

    const interval = setInterval(() => {
      if (content.title || content.article_body) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [content, editingContent]);

  // Update word count
  useEffect(() => {
    const words = content.article_body.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content.article_body]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Get allowed subjects for this teacher
  const allowedSubjects = activeSubjects.filter(s => 
    allocation?.subjects.some(as => as.toLowerCase() === s.name.toLowerCase())
  );

  const handleChange = useCallback((field: keyof ContentData, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!content.title || !content.subject || !content.class) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (content.content_type === 'article' && !content.article_body) {
      toast({
        variant: 'destructive',
        title: 'Article body required',
        description: 'Please enter the article content.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const contentData = {
        title: content.title,
        description: content.description || null,
        url: content.url || null,
        content_type: content.content_type,
        class: content.class,
        language: content.language,
        subject: content.subject,
        article_body: content.article_body || null,
        image_url: content.image_url || null,
        created_by: userId,
      };

      if (content.id) {
        // Update existing
        const { error } = await supabase
          .from('content')
          .update({ ...contentData, version: (editingContent as any)?.version ? (editingContent as any).version + 1 : 1 })
          .eq('id', content.id);

        if (error) throw error;

        toast({ title: 'Content updated', description: 'Learning content has been updated.' });
      } else {
        // Insert new
        const { error } = await supabase
          .from('content')
          .insert({ ...contentData, version: 1 });

        if (error) throw error;

        // Clear draft
        localStorage.removeItem(DRAFT_KEY);
        toast({ title: 'Content added', description: 'New learning content has been created.' });
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save content.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasNoAllocation = !allocationLoading && (!allocation || allocation.subjects.length === 0);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      {/* Header */}
      <header className="sticky top-0 border-b bg-card/95 backdrop-blur px-6 py-4 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">
              {content.id ? 'Edit Learning Content' : 'Add Learning Content'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {content.content_type === 'article' && (
              <Badge variant="secondary">{wordCount} words</Badge>
            )}
            <Button onClick={handleSubmit} disabled={submitting || hasNoAllocation}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {content.id ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        {hasNoAllocation && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              You have no subject allocation. Please contact your admin to get assigned subjects.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">Title *</Label>
              <Input
                id="title"
                value={content.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter a clear, descriptive title"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={content.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this content"
                rows={2}
              />
            </div>

            {/* Content Type Specific Fields */}
            {content.content_type === 'article' && (
              <div className="space-y-2">
                <Label htmlFor="articleBody" className="text-base font-medium">Article Content *</Label>
                <Textarea
                  id="articleBody"
                  value={content.article_body}
                  onChange={(e) => handleChange('article_body', e.target.value)}
                  placeholder="Write the full article content here. Students can highlight, underline, and add notes to this text."
                  rows={16}
                  className="font-serif text-base leading-relaxed"
                />
              </div>
            )}

            {content.content_type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={content.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or direct video URL"
                />
                <p className="text-xs text-muted-foreground">
                  Videos are streamed online only and cannot be downloaded for offline use.
                </p>
              </div>
            )}

            {content.content_type === 'pdf' && (
              <div className="space-y-2">
                <Label>Upload PDF *</Label>
                <ContentFileUpload
                  type="pdf"
                  value={content.url}
                  onChange={(url) => handleChange('url', url || '')}
                />
              </div>
            )}

            {content.content_type === 'image' && (
              <div className="space-y-2">
                <Label>Upload Image *</Label>
                <ContentFileUpload
                  type="image"
                  value={content.image_url}
                  onChange={(url) => handleChange('image_url', url || '')}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={content.content_type} 
                    onValueChange={(v) => handleChange('content_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Article
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Video
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          PDF
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select 
                    value={content.subject} 
                    onValueChange={(v) => handleChange('subject', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {getSubjectLabel(subject.name, 'english')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {allowedSubjects.length === 0 && !allocationLoading && (
                    <p className="text-xs text-muted-foreground">
                      No subjects allocated
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select 
                    value={content.class} 
                    onValueChange={(v) => handleChange('class', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {(allocation?.classes || []).map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={content.language} 
                    onValueChange={(v) => handleChange('language', v as 'hindi' | 'english')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(allocation?.languages || ['hindi', 'english']).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang === 'hindi' ? 'Hindi' : 'English'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use clear, simple language</li>
                  <li>• Break content into short paragraphs</li>
                  <li>• Articles support offline access</li>
                  <li>• Videos require internet connection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
