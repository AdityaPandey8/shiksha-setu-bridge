/**
 * SubjectManagement Component
 * 
 * Admin component to manage the master subject list.
 * Allows adding new subjects and toggling active status.
 */

import { useState } from 'react';
import { Plus, Loader2, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSubjects, Subject } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function SubjectManagement() {
  const { subjects, loading, refetch } = useSubjects();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    label_en: '',
    label_hi: '',
  });

  const handleAddSubject = async () => {
    if (!newSubject.name || !newSubject.label_en || !newSubject.label_hi) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('subjects').insert({
        name: newSubject.name.toLowerCase().replace(/\s+/g, '_'),
        label_en: newSubject.label_en,
        label_hi: newSubject.label_hi,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Subject Added',
        description: `${newSubject.label_en} has been added successfully.`,
      });

      setNewSubject({ name: '', label_en: '', label_hi: '' });
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Error adding subject:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add subject.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (subject: Subject) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ is_active: !subject.is_active })
        .eq('id', subject.id);

      if (error) throw error;

      toast({
        title: 'Subject Updated',
        description: `${subject.label_en} is now ${subject.is_active ? 'disabled' : 'enabled'}.`,
      });

      refetch();
    } catch (error: any) {
      console.error('Error updating subject:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update subject status.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Manage Subjects
            </CardTitle>
            <CardDescription>
              Add, enable, or disable subjects across the platform
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject that can be assigned to teachers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject Key *</Label>
                  <Input
                    id="subjectName"
                    placeholder="e.g., physics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ 
                      ...prev, 
                      name: e.target.value.toLowerCase().replace(/\s+/g, '_') 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (lowercase, no spaces)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labelEn">English Label *</Label>
                  <Input
                    id="labelEn"
                    placeholder="e.g., Physics"
                    value={newSubject.label_en}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, label_en: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labelHi">Hindi Label *</Label>
                  <Input
                    id="labelHi"
                    placeholder="e.g., भौतिक विज्ञान"
                    value={newSubject.label_hi}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, label_hi: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleAddSubject}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Subject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No subjects configured yet.</p>
            <p className="text-sm">Click "Add Subject" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>Hindi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-mono text-sm">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject.label_en}</TableCell>
                    <TableCell>{subject.label_hi}</TableCell>
                    <TableCell>
                      <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                        {subject.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(subject)}
                      >
                        {subject.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
