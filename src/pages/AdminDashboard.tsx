import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Plus, Loader2, ArrowLeft, Eye, EyeOff, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Teacher {
  id: string;
  email: string;
  full_name: string | null;
  subjects: string[];
  classes: string[];
  is_active: boolean;
  created_at: string;
}

const AVAILABLE_SUBJECTS = ['Maths', 'Science', 'English', 'Hindi', 'Social Science'];
const AVAILABLE_CLASSES = ['6', '7', '8', '9', '10'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading, signOut } = useAuth();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    password: '',
    subjects: [] as string[],
    classes: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth?role=admin');
    }
  }, [user, role, authLoading, navigate]);

  // Fetch teachers
  useEffect(() => {
    if (user && role === 'admin') {
      fetchTeachers();
    }
  }, [user, role]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Fetch teacher assignments
      const { data: assignments, error: assignError } = await supabase
        .from('teacher_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assignError) throw assignError;

      // Fetch profiles for these teachers
      const teacherIds = assignments?.map(a => a.teacher_id) || [];
      
      if (teacherIds.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', teacherIds);

      if (profileError) throw profileError;

      // Combine data
      const teacherList: Teacher[] = (assignments || []).map(assignment => {
        const profile = profiles?.find(p => p.id === assignment.teacher_id);
        return {
          id: assignment.teacher_id,
          email: profile?.email || '',
          full_name: profile?.full_name || null,
          subjects: assignment.subjects || [],
          classes: assignment.classes || [],
          is_active: assignment.is_active,
          created_at: assignment.created_at,
        };
      });

      setTeachers(teacherList);

      // Cache for offline access
      localStorage.setItem('shiksha_setu_admin_teachers', JSON.stringify(teacherList));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      
      // Try to load from cache
      const cached = localStorage.getItem('shiksha_setu_admin_teachers');
      if (cached) {
        setTeachers(JSON.parse(cached));
        toast({
          title: 'Offline Mode',
          description: 'Showing cached teacher data.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacher(prev => ({ ...prev, password }));
  };

  const handleSubjectToggle = (subject: string) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleClassToggle = (cls: string) => {
    setNewTeacher(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls],
    }));
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (newTeacher.subjects.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one subject.',
      });
      return;
    }

    if (newTeacher.classes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one class.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('admin-create-teacher', {
        body: {
          email: newTeacher.email,
          password: newTeacher.password,
          fullName: newTeacher.fullName,
          subjects: newTeacher.subjects,
          classes: newTeacher.classes,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: 'Success',
        description: `Teacher ${newTeacher.fullName} has been added successfully.`,
      });

      // Reset form and close dialog
      setNewTeacher({
        fullName: '',
        email: '',
        password: '',
        subjects: [],
        classes: [],
      });
      setIsAddDialogOpen(false);
      
      // Refresh teacher list
      fetchTeachers();
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add teacher.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTeacherStatus = async (teacherId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teacher_assignments')
        .update({ is_active: !currentStatus })
        .eq('teacher_id', teacherId);

      if (error) throw error;

      setTeachers(prev =>
        prev.map(t =>
          t.id === teacherId ? { ...t, is_active: !currentStatus } : t
        )
      );

      toast({
        title: 'Success',
        description: `Teacher ${currentStatus ? 'disabled' : 'enabled'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update teacher status.',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Shiksha Setu Control Panel</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {teachers.filter(t => t.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disabled Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {teachers.filter(t => !t.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manage Teachers Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage Teachers
                </CardTitle>
                <CardDescription>
                  Add, view and manage teacher accounts
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                      Create a new teacher account with assigned subjects and classes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter teacher's full name"
                        value={newTeacher.fullName}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="teacher@shikshasetu.com"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter or generate password"
                            value={newTeacher.password}
                            onChange={(e) => setNewTeacher(prev => ({ ...prev, password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subjects *</Label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`subject-${subject}`}
                              checked={newTeacher.subjects.includes(subject)}
                              onCheckedChange={() => handleSubjectToggle(subject)}
                            />
                            <Label htmlFor={`subject-${subject}`} className="text-sm font-normal cursor-pointer">
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Classes *</Label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_CLASSES.map((cls) => (
                          <div key={cls} className="flex items-center space-x-2">
                            <Checkbox
                              id={`class-${cls}`}
                              checked={newTeacher.classes.includes(cls)}
                              onCheckedChange={() => handleClassToggle(cls)}
                            />
                            <Label htmlFor={`class-${cls}`} className="text-sm font-normal cursor-pointer">
                              Class {cls}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleAddTeacher}
                      disabled={submitting}
                      className="w-full"
                    >
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Add Teacher
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
            ) : teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers added yet.</p>
                <p className="text-sm">Click "Add Teacher" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">
                          {teacher.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.map((c) => (
                              <Badge key={c} variant="outline" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                            {teacher.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleTeacherStatus(teacher.id, teacher.is_active)}
                          >
                            {teacher.is_active ? (
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
      </main>
    </div>
  );
}