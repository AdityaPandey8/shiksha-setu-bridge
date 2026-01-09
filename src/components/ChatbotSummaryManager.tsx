/**
 * ChatbotSummaryManager Component
 * 
 * Allows teachers to create and manage chapter summaries for Setu Saarthi offline mode.
 * Summaries are used by the chatbot to answer student questions offline.
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Edit2, MessageSquare, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotSummary {
  id: string;
  class: string;
  subject: string;
  chapter_id: string;
  summary_text: string;
  key_points: string[] | null;
  language: 'hindi' | 'english';
  created_at: string;
  updated_at: string;
}

const SUBJECTS = [
  { value: 'mathematics', labelEn: 'Mathematics', labelHi: 'गणित' },
  { value: 'science', labelEn: 'Science', labelHi: 'विज्ञान' },
  { value: 'social_science', labelEn: 'Social Science', labelHi: 'सामाजिक विज्ञान' },
  { value: 'hindi', labelEn: 'Hindi', labelHi: 'हिंदी' },
  { value: 'english', labelEn: 'English', labelHi: 'अंग्रेज़ी' },
];

export function ChatbotSummaryManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, isHindi } = useLanguage();
  
  const [summaries, setSummaries] = useState<ChatbotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formClass, setFormClass] = useState('8');
  const [formSubject, setFormSubject] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formSummaryText, setFormSummaryText] = useState('');
  const [formKeyPoints, setFormKeyPoints] = useState('');
  const [formLanguage, setFormLanguage] = useState<'hindi' | 'english'>('hindi');

  const fetchSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries((data as ChatbotSummary[]) || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to load chatbot summaries.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const resetForm = () => {
    setFormClass('8');
    setFormSubject('');
    setFormChapterId('');
    setFormSummaryText('');
    setFormKeyPoints('');
    setFormLanguage('hindi');
    setEditingId(null);
  };

  const openEditDialog = (summary: ChatbotSummary) => {
    setEditingId(summary.id);
    setFormClass(summary.class);
    setFormSubject(summary.subject);
    setFormChapterId(summary.chapter_id);
    setFormSummaryText(summary.summary_text);
    setFormKeyPoints(summary.key_points?.join('\n') || '');
    setFormLanguage(summary.language);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject || !formChapterId || !formSummaryText) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: isHindi ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields',
      });
      return;
    }

    setSubmitting(true);

    try {
      const keyPointsArray = formKeyPoints
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const summaryData = {
        class: formClass,
        subject: formSubject,
        chapter_id: formChapterId,
        summary_text: formSummaryText,
        key_points: keyPointsArray.length > 0 ? keyPointsArray : null,
        language: formLanguage,
        created_by: user?.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('chatbot_summaries')
          .update(summaryData)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: isHindi ? 'सारांश अपडेट किया गया!' : 'Summary Updated!',
          description: isHindi ? 'चैटबॉट सारांश सफलतापूर्वक अपडेट किया गया।' : 'Chatbot summary updated successfully.',
        });
      } else {
        const { error } = await supabase
          .from('chatbot_summaries')
          .insert(summaryData);

        if (error) throw error;

        toast({
          title: isHindi ? 'सारांश जोड़ा गया!' : 'Summary Added!',
          description: isHindi ? 'चैटबॉट सारांश सफलतापूर्वक जोड़ा गया।' : 'Chatbot summary added successfully.',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchSummaries();
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to save summary.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_summaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isHindi ? 'सारांश हटाया गया' : 'Summary Deleted',
        description: isHindi ? 'चैटबॉट सारांश हटा दिया गया।' : 'Chatbot summary has been deleted.',
      });

      fetchSummaries();
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to delete summary.',
      });
    }
  };

  const getSubjectLabel = (value: string) => {
    const subject = SUBJECTS.find(s => s.value === value);
    return subject ? (isHindi ? subject.labelHi : subject.labelEn) : value;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>
                {isHindi ? 'चैटबॉट सारांश' : 'Chatbot Summaries'}
              </CardTitle>
              <CardDescription>
                {isHindi 
                  ? 'सेतु सार्थी के ऑफलाइन मोड के लिए अध्याय सारांश प्रबंधित करें'
                  : 'Manage chapter summaries for Setu Saarthi offline mode'}
              </CardDescription>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {isHindi ? 'सारांश जोड़ें' : 'Add Summary'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId 
                    ? (isHindi ? 'सारांश संपादित करें' : 'Edit Summary')
                    : (isHindi ? 'नया सारांश जोड़ें' : 'Add New Summary')}
                </DialogTitle>
                <DialogDescription>
                  {isHindi 
                    ? 'यह सारांश छात्रों को ऑफलाइन मोड में सेतु सार्थी द्वारा दिया जाएगा'
                    : 'This summary will be used by Setu Saarthi to answer students offline'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('class')}</Label>
                    <Select value={formClass} onValueChange={setFormClass}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">{t('class6')}</SelectItem>
                        <SelectItem value="7">{t('class7')}</SelectItem>
                        <SelectItem value="8">{t('class8')}</SelectItem>
                        <SelectItem value="9">{t('class9')}</SelectItem>
                        <SelectItem value="10">{t('class10')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isHindi ? 'विषय' : 'Subject'} *</Label>
                    <Select value={formSubject} onValueChange={setFormSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(subject => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {isHindi ? subject.labelHi : subject.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isHindi ? 'अध्याय ID/नाम' : 'Chapter ID/Name'} *</Label>
                    <Input
                      value={formChapterId}
                      onChange={(e) => setFormChapterId(e.target.value)}
                      placeholder={isHindi ? 'जैसे: ch1_motion' : 'e.g., ch1_motion'}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('language')}</Label>
                    <Select value={formLanguage} onValueChange={(v) => setFormLanguage(v as 'hindi' | 'english')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hindi">{t('hindi')}</SelectItem>
                        <SelectItem value="english">{t('english')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isHindi ? 'अध्याय सारांश' : 'Chapter Summary'} * (5-10 {isHindi ? 'पंक्तियाँ' : 'lines'})</Label>
                  <Textarea
                    value={formSummaryText}
                    onChange={(e) => setFormSummaryText(e.target.value)}
                    placeholder={isHindi 
                      ? 'इस अध्याय का संक्षिप्त सारांश लिखें जो छात्रों को ऑफलाइन में दिखाया जाएगा...'
                      : 'Write a brief summary of this chapter that will be shown to students offline...'}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isHindi ? 'मुख्य बिंदु' : 'Key Points'} ({isHindi ? 'वैकल्पिक' : 'optional'})</Label>
                  <Textarea
                    value={formKeyPoints}
                    onChange={(e) => setFormKeyPoints(e.target.value)}
                    placeholder={isHindi 
                      ? 'प्रत्येक मुख्य बिंदु नई पंक्ति में लिखें...'
                      : 'Enter each key point on a new line...'}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isHindi ? 'प्रति पंक्ति एक बिंदु' : 'One point per line'}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {submitting 
                    ? t('saving')
                    : (editingId 
                        ? (isHindi ? 'अपडेट करें' : 'Update')
                        : (isHindi ? 'सारांश जोड़ें' : 'Add Summary'))}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {summaries.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {isHindi 
                ? 'अभी तक कोई सारांश नहीं जोड़ा गया। सेतु सार्थी को ऑफलाइन प्रश्नों का उत्तर देने के लिए सारांश जोड़ें।'
                : 'No summaries added yet. Add summaries to enable Setu Saarthi to answer offline questions.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('class')}</TableHead>
                <TableHead>{isHindi ? 'विषय' : 'Subject'}</TableHead>
                <TableHead>{isHindi ? 'अध्याय' : 'Chapter'}</TableHead>
                <TableHead>{t('language')}</TableHead>
                <TableHead>{isHindi ? 'अंतिम अपडेट' : 'Last Updated'}</TableHead>
                <TableHead className="text-right">{isHindi ? 'कार्य' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.id}>
                  <TableCell>{t('class')} {summary.class}</TableCell>
                  <TableCell>{getSubjectLabel(summary.subject)}</TableCell>
                  <TableCell className="font-medium">{summary.chapter_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {summary.language === 'hindi' ? t('hindi') : t('english')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(summary.updated_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(summary)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {isHindi ? 'सारांश हटाएं?' : 'Delete Summary?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {isHindi 
                                ? 'क्या आप वाकई इस सारांश को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
                                : 'Are you sure you want to delete this summary? This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(summary.id)}>
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
