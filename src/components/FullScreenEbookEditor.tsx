/**
 * FullScreenEbookEditor Component
 * 
 * A full-screen, focused editor for teachers to add/edit E-Books.
 * Features:
 * - Distraction-free full-screen mode
 * - PDF upload with preview
 * - Subject restriction based on teacher allocation
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, FileText, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTeacherAllocation } from '@/hooks/useTeacherAllocation';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';

interface EbookData {
  id?: string;
  title: string;
  subject: string;
  description: string;
  class: string;
  language: 'hindi' | 'english';
  offline_enabled: boolean;
  pdf_url?: string;
  pdf_filename?: string;
}

interface FullScreenEbookEditorProps {
  editingEbook?: EbookData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function FullScreenEbookEditor({
  editingEbook,
  onClose,
  onSaved,
}: FullScreenEbookEditorProps) {
  const { toast } = useToast();
  const { allocation, loading: allocationLoading } = useTeacherAllocation();
  const { activeSubjects, getSubjectLabel } = useSubjects();

  const [ebook, setEbook] = useState<EbookData>({
    title: '',
    subject: '',
    description: '',
    class: '',
    language: 'hindi',
    offline_enabled: true,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize from editing ebook
  useEffect(() => {
    if (editingEbook) {
      setEbook(editingEbook);
    }
  }, [editingEbook]);

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

  const handleSubmit = async () => {
    if (!ebook.title || !ebook.subject || !ebook.class) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (!ebook.id && !pdfFile) {
      toast({
        variant: 'destructive',
        title: 'PDF required',
        description: 'Please upload a PDF file.',
      });
      return;
    }

    setSubmitting(true);

    try {
      let pdfUrl = ebook.pdf_url || '';
      let pdfFilename = ebook.pdf_filename || '';

      // Upload PDF if new file selected
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ebooks')
          .upload(fileName, pdfFile, { contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('ebooks')
          .getPublicUrl(fileName);

        pdfUrl = urlData.publicUrl;
        pdfFilename = pdfFile.name;

        // Delete old file if updating
        if (ebook.pdf_url) {
          const oldFileName = ebook.pdf_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('ebooks').remove([oldFileName]);
          }
        }
      }

      if (ebook.id) {
        // Update existing
        const { error } = await supabase
          .from('ebooks')
          .update({
            title: ebook.title,
            subject: ebook.subject,
            description: ebook.description || null,
            class: ebook.class,
            language: ebook.language,
            offline_enabled: ebook.offline_enabled,
            pdf_url: pdfUrl,
            pdf_filename: pdfFilename,
          })
          .eq('id', ebook.id);

        if (error) throw error;

        toast({ title: 'E-Book updated', description: 'The E-Book has been updated.' });
      } else {
        // Insert new
        const { error } = await supabase
          .from('ebooks')
          .insert({
            title: ebook.title,
            subject: ebook.subject,
            description: ebook.description || null,
            class: ebook.class,
            language: ebook.language,
            offline_enabled: ebook.offline_enabled,
            pdf_url: pdfUrl,
            pdf_filename: pdfFilename,
          });

        if (error) throw error;

        toast({ title: 'E-Book added', description: 'New E-Book has been created.' });
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving ebook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save E-Book.',
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
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">
              {ebook.id ? 'Edit E-Book' : 'Add E-Book'}
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={submitting || hasNoAllocation}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {ebook.id ? 'Update' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {hasNoAllocation && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              You have no subject allocation. Please contact your admin to get assigned subjects.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">Book Title *</Label>
                  <Input
                    id="title"
                    value={ebook.title}
                    onChange={(e) => setEbook(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter the book title"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select 
                    value={ebook.subject} 
                    onValueChange={(v) => setEbook(prev => ({ ...prev, subject: v }))}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={ebook.description}
                    onChange={(e) => setEbook(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this E-Book"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select 
                      value={ebook.class} 
                      onValueChange={(v) => setEbook(prev => ({ ...prev, class: v }))}
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
                      value={ebook.language} 
                      onValueChange={(v) => setEbook(prev => ({ ...prev, language: v as 'hindi' | 'english' }))}
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
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label>Enable Offline Download</Label>
                    <p className="text-xs text-muted-foreground">
                      Students can download this E-Book
                    </p>
                  </div>
                  <Switch
                    checked={ebook.offline_enabled}
                    onCheckedChange={(v) => setEbook(prev => ({ ...prev, offline_enabled: v }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - PDF Upload */}
          <div className="space-y-6">
            <Card className="h-full">
              <CardContent className="pt-6 space-y-4">
                <Label className="text-base font-medium">
                  PDF File {!ebook.id && '*'}
                </Label>
                
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    {pdfFile ? (
                      <>
                        <FileText className="h-12 w-12 text-primary" />
                        <div>
                          <p className="font-medium">{pdfFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Badge variant="secondary">Ready to upload</Badge>
                      </>
                    ) : ebook.pdf_url ? (
                      <>
                        <FileText className="h-12 w-12 text-green-600" />
                        <div>
                          <p className="font-medium">{ebook.pdf_filename || 'Current PDF'}</p>
                          <p className="text-sm text-muted-foreground">Click to replace</p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Uploaded
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Click to upload PDF</p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {ebook.pdf_url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(ebook.pdf_url, '_blank')}
                  >
                    Preview Current PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
