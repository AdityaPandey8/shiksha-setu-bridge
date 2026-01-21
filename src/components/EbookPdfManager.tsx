/**
 * EbookPdfManager Component
 * 
 * Teacher interface for managing E-Books with PDF upload support.
 * Features:
 * - Upload PDF files to Supabase storage
 * - Add/Edit/Delete E-Books with metadata
 * - Subject restrictions based on teacher allocation
 * - Sync to database for all students
 */

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, Edit, Upload, FileText, Loader2, ExternalLink, AlertTriangle, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { useTeacherAllocation } from '@/hooks/useTeacherAllocation';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';

interface EbookRecord {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  class: string;
  language: 'hindi' | 'english';
  pdf_url: string;
  pdf_filename: string | null;
  offline_enabled: boolean;
  created_at: string;
}

interface EbookPdfManagerProps {
  onOpenFullScreen?: () => void;
}

export function EbookPdfManager({ onOpenFullScreen }: EbookPdfManagerProps) {
  const { t, language: preferredLanguage } = useLanguage();
  const { toast } = useToast();
  const { allocation, loading: allocationLoading } = useTeacherAllocation();
  const { getSubjectLabel } = useSubjects();
  
  const [ebooks, setEbooks] = useState<EbookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<EbookRecord | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ebookClass, setEbookClass] = useState('6');
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set defaults from allocation
  useEffect(() => {
    if (allocation && !allocationLoading) {
      if (allocation.classes.length > 0) setEbookClass(allocation.classes[0]);
      if (allocation.languages.length > 0) setLanguage(allocation.languages[0] as 'hindi' | 'english');
      if (allocation.subjects.length > 0 && !subject) setSubject(allocation.subjects[0]);
    }
  }, [allocation, allocationLoading]);

  // Fetch ebooks
  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubject(allocation?.subjects[0] || '');
    setDescription('');
    setEbookClass(allocation?.classes[0] || '6');
    setLanguage((allocation?.languages[0] as 'hindi' | 'english') || 'hindi');
    setOfflineEnabled(true);
    setPdfFile(null);
    setEditingEbook(null);
  };

  const handleOpenDialog = (ebook?: EbookRecord) => {
    if (ebook) {
      setEditingEbook(ebook);
      setTitle(ebook.title);
      setSubject(ebook.subject);
      setDescription(ebook.description || '');
      setEbookClass(ebook.class);
      setLanguage(ebook.language);
      setOfflineEnabled(ebook.offline_enabled);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEbook && !pdfFile) {
      toast({
        variant: 'destructive',
        title: 'PDF Required',
        description: 'Please upload a PDF file for the E-Book.',
      });
      return;
    }

    // Validate against allocation
    if (allocation && !allocation.subjects.includes(subject)) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized Subject',
        description: 'You are not allocated to create E-Books for this subject.',
      });
      return;
    }

    setSubmitting(true);

    try {
      let pdfUrl = editingEbook?.pdf_url || '';
      let pdfFilename = editingEbook?.pdf_filename || '';

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
        if (editingEbook?.pdf_url) {
          const oldFileName = editingEbook.pdf_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('ebooks').remove([oldFileName]);
          }
        }
      }

      if (editingEbook) {
        // Update existing ebook
        const { error } = await supabase
          .from('ebooks')
          .update({
            title,
            subject,
            description: description || null,
            class: ebookClass,
            language,
            offline_enabled: offlineEnabled,
            pdf_url: pdfUrl,
            pdf_filename: pdfFilename,
          })
          .eq('id', editingEbook.id);

        if (error) throw error;

        toast({
          title: 'E-Book Updated',
          description: 'The E-Book has been updated successfully.',
        });
      } else {
        // Create new ebook
        const { error } = await supabase
          .from('ebooks')
          .insert({
            title,
            subject,
            description: description || null,
            class: ebookClass,
            language,
            offline_enabled: offlineEnabled,
            pdf_url: pdfUrl,
            pdf_filename: pdfFilename,
          });

        if (error) throw error;

        toast({
          title: 'E-Book Added',
          description: 'The E-Book has been added successfully.',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchEbooks();
    } catch (error) {
      console.error('Error saving ebook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save E-Book. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ebook: EbookRecord) => {
    try {
      // Delete PDF from storage
      if (ebook.pdf_url) {
        const fileName = ebook.pdf_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('ebooks').remove([fileName]);
        }
      }

      // Delete record
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', ebook.id);

      if (error) throw error;

      toast({
        title: 'E-Book Deleted',
        description: 'The E-Book has been deleted successfully.',
      });

      fetchEbooks();
    } catch (error) {
      console.error('Error deleting ebook:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete E-Book.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t('ebooks')} (PDF)
            </CardTitle>
            <CardDescription>Upload and manage PDF E-Books for students</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add E-Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEbook ? 'Edit E-Book' : 'Add New E-Book'}
                </DialogTitle>
                <DialogDescription>
                  Upload a PDF file and add E-Book details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter book title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {allocation?.subjects.length ? (
                        allocation.subjects.map(subj => (
                          <SelectItem key={subj} value={subj}>
                            {getSubjectLabel(subj, preferredLanguage === 'hi' ? 'hindi' : 'english')}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No subjects allocated</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {allocation && allocation.subjects.length === 0 && (
                    <p className="text-xs text-destructive">
                      You have no subjects allocated. Contact Admin.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={ebookClass} onValueChange={setEbookClass}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(allocation?.classes.length ? allocation.classes : ['6', '7', '8', '9', '10']).map(cls => (
                          <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as 'hindi' | 'english')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(allocation?.languages.length ? allocation.languages : ['hindi', 'english']).map(lang => (
                          <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf">PDF File {!editingEbook && '*'}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {pdfFile && (
                      <Badge variant="secondary" className="shrink-0">
                        <FileText className="h-3 w-3 mr-1" />
                        {pdfFile.name.substring(0, 20)}...
                      </Badge>
                    )}
                  </div>
                  {editingEbook && !pdfFile && (
                    <p className="text-xs text-muted-foreground">
                      Current: {editingEbook.pdf_filename || 'PDF file'}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="offline">Enable Offline Download</Label>
                  <Switch
                    id="offline"
                    checked={offlineEnabled}
                    onCheckedChange={setOfflineEnabled}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submitting ? 'Saving...' : (editingEbook ? 'Update E-Book' : 'Add E-Book')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ebooks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No E-Books uploaded yet. Click "Add E-Book" to upload your first PDF.
          </p>
        ) : (
          <div className="space-y-3">
            {ebooks.map((ebook) => (
              <Card key={ebook.id} className="border">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{ebook.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {ebook.subject}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Class {ebook.class}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {ebook.language === 'hindi' ? 'Hindi' : 'English'}
                          </Badge>
                          {ebook.offline_enabled && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(ebook.pdf_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(ebook)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete E-Book</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{ebook.title}"? This will also delete the PDF file.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(ebook)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}