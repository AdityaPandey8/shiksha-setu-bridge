import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Plus, Loader2, ArrowLeft, Eye, EyeOff, BookOpen, ToggleLeft, ToggleRight, Settings, Pencil, GraduationCap, Trash2, Search, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubjectManagement } from '@/components/SubjectManagement';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  languages: string[];
  is_active: boolean;
  created_at: string;
}

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  class: string | null;
  language: 'hindi' | 'english' | null;
  selected_subjects: string[] | null;
  created_at: string;
}

const AVAILABLE_CLASSES = ['6', '7', '8', '9', '10'];
const AVAILABLE_LANGUAGES = ['hindi', 'english'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const { activeSubjects, getSubjectLabel } = useSubjects();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Student management
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    full_name: '',
    class: '',
    language: 'hindi' as 'hindi' | 'english',
  });

  // Teacher delete/password reset
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordTeacher, setResetPasswordTeacher] = useState<Teacher | null>(null);
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  // Form state
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    password: '',
    subjects: [] as string[],
    classes: [] as string[],
    languages: ['hindi', 'english'] as string[],
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
          languages: assignment.languages || ['hindi', 'english'],
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

  // Fetch students
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch student roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      const studentIds = rolesData?.map(r => r.user_id) || [];
      const studentList = (profilesData || [])
        .filter(p => studentIds.includes(p.id))
        .map(p => ({
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          class: p.class,
          language: p.language,
          selected_subjects: p.selected_subjects,
          created_at: p.created_at,
        }));

      setStudents(studentList);
      localStorage.setItem('shiksha_setu_admin_students', JSON.stringify(studentList));
    } catch (error) {
      console.error('Error fetching students:', error);
      const cached = localStorage.getItem('shiksha_setu_admin_students');
      if (cached) {
        setStudents(JSON.parse(cached));
        toast({
          title: 'Offline Mode',
          description: 'Showing cached student data.',
        });
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      full_name: student.full_name || '',
      class: student.class || '',
      language: student.language || 'hindi',
    });
    setIsEditStudentDialogOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: studentFormData.full_name,
          class: studentFormData.class,
          language: studentFormData.language,
        })
        .eq('id', editingStudent.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student profile updated successfully.',
      });

      setIsEditStudentDialogOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update student.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // Delete from user_roles first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', studentId);

      if (roleError) throw roleError;

      // Delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (profileError) throw profileError;

      toast({
        title: 'Success',
        description: 'Student deleted successfully.',
      });

      fetchStudents();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete student.',
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = studentSearchQuery === '' || 
      student.full_name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchQuery.toLowerCase());
    const matchesClass = studentClassFilter === 'all' || student.class === studentClassFilter;
    return matchesSearch && matchesClass;
  });

  // Fetch students when component mounts
  useEffect(() => {
    if (user && role === 'admin') {
      fetchStudents();
    }
  }, [user, role]);

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

  const handleLanguageToggle = (lang: string) => {
    setNewTeacher(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
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

    if (newTeacher.languages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one language.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await supabase.functions.invoke('admin-create-teacher', {
        body: {
          email: newTeacher.email,
          password: newTeacher.password,
          fullName: newTeacher.fullName,
          subjects: newTeacher.subjects,
          classes: newTeacher.classes,
          languages: newTeacher.languages,
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
      resetNewTeacherForm();
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

  const resetNewTeacherForm = () => {
    setNewTeacher({
      fullName: '',
      email: '',
      password: '',
      subjects: [],
      classes: [],
      languages: ['hindi', 'english'],
    });
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      fullName: teacher.full_name || '',
      email: teacher.email,
      password: '',
      subjects: teacher.subjects,
      classes: teacher.classes,
      languages: teacher.languages,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

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
      const { error } = await supabase
        .from('teacher_assignments')
        .update({
          subjects: newTeacher.subjects,
          classes: newTeacher.classes,
          languages: newTeacher.languages,
        })
        .eq('teacher_id', editingTeacher.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Teacher allocation updated successfully.',
      });

      setIsEditDialogOpen(false);
      setEditingTeacher(null);
      resetNewTeacherForm();
      fetchTeachers();
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update teacher.',
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

  const handleDeleteTeacher = async (teacherId: string) => {
    setDeletingTeacherId(teacherId);
    try {
      const response = await supabase.functions.invoke('admin-manage-teacher', {
        body: { action: 'delete', teacherId },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      toast({
        title: 'Success',
        description: 'Teacher account deleted successfully.',
      });

      fetchTeachers();
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete teacher.',
      });
    } finally {
      setDeletingTeacherId(null);
    }
  };

  const handleResetTeacherPassword = async () => {
    if (!resetPasswordTeacher || !newTeacherPassword) return;

    if (newTeacherPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    setResettingPassword(true);
    try {
      const response = await supabase.functions.invoke('admin-manage-teacher', {
        body: {
          action: 'reset_password',
          teacherId: resetPasswordTeacher.id,
          newPassword: newTeacherPassword,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      toast({
        title: 'Success',
        description: `Password reset successfully for ${resetPasswordTeacher.full_name || resetPasswordTeacher.email}.`,
      });

      setIsResetPasswordDialogOpen(false);
      setResetPasswordTeacher(null);
      setNewTeacherPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reset password.',
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const openResetPasswordDialog = (teacher: Teacher) => {
    setResetPasswordTeacher(teacher);
    setNewTeacherPassword('');
    setIsResetPasswordDialogOpen(true);
  };

  const generateResetPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTeacherPassword(password);
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="Profile & Settings">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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

        {/* Tabs for Teachers and Subjects */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teachers">Manage Teachers</TabsTrigger>
            <TabsTrigger value="students">Manage Students</TabsTrigger>
            <TabsTrigger value="subjects">Manage Subjects</TabsTrigger>
          </TabsList>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Manage Teachers
                    </CardTitle>
                    <CardDescription>
                      Add, view and manage teacher accounts and their subject allocations
                    </CardDescription>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" onClick={resetNewTeacherForm}>
                        <Plus className="h-4 w-4" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Teacher</DialogTitle>
                        <DialogDescription>
                          Create a new teacher account with assigned subjects, classes, and languages.
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
                          <Label>Subjects * (from active subjects)</Label>
                          <div className="flex flex-wrap gap-2">
                            {activeSubjects.map((subject) => (
                              <div key={subject.name} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`subject-${subject.name}`}
                                  checked={newTeacher.subjects.includes(subject.name)}
                                  onCheckedChange={() => handleSubjectToggle(subject.name)}
                                />
                                <Label htmlFor={`subject-${subject.name}`} className="text-sm font-normal cursor-pointer">
                                  {subject.label_en}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {activeSubjects.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No subjects available. Add subjects in the "Manage Subjects" tab first.
                            </p>
                          )}
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
                        <div className="space-y-2">
                          <Label>Languages *</Label>
                          <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map((lang) => (
                              <div key={lang} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`lang-${lang}`}
                                  checked={newTeacher.languages.includes(lang)}
                                  onCheckedChange={() => handleLanguageToggle(lang)}
                                />
                                <Label htmlFor={`lang-${lang}`} className="text-sm font-normal cursor-pointer capitalize">
                                  {lang}
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
                          <TableHead>Languages</TableHead>
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
                                    {getSubjectLabel(s, 'english')}
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
                              <div className="flex flex-wrap gap-1">
                                {teacher.languages.map((l) => (
                                  <Badge key={l} variant="outline" className="text-xs capitalize">
                                    {l}
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
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTeacher(teacher)}
                                  title="Edit Allocation"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openResetPasswordDialog(teacher)}
                                  title="Reset Password"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleTeacherStatus(teacher.id, teacher.is_active)}
                                  title={teacher.is_active ? 'Disable Teacher' : 'Enable Teacher'}
                                >
                                  {teacher.is_active ? (
                                    <ToggleRight className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      title="Delete Teacher"
                                      disabled={deletingTeacherId === teacher.id}
                                    >
                                      {deletingTeacherId === teacher.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Teacher Account</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{teacher.full_name || teacher.email}</strong>? 
                                        This action cannot be undone and will permanently remove their account and all associated data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTeacher(teacher.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Manage Students
                    </CardTitle>
                    <CardDescription>
                      View, edit, and manage student accounts
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="pl-9 w-[250px]"
                      />
                    </div>
                    <Select value={studentClassFilter} onValueChange={setStudentClassFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {AVAILABLE_CLASSES.map(cls => (
                          <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{students.length === 0 ? 'No students registered yet.' : 'No students match your search.'}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Subjects</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.full_name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {student.email}
                            </TableCell>
                            <TableCell>
                              {student.class ? (
                                <Badge variant="outline">Class {student.class}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="capitalize">
                              {student.language || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {student.selected_subjects?.length ? (
                                  student.selected_subjects.slice(0, 3).map(s => (
                                    <Badge key={s} variant="secondary" className="text-xs">
                                      {getSubjectLabel(s, 'english')}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-xs">None selected</span>
                                )}
                                {(student.selected_subjects?.length || 0) > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{student.selected_subjects!.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditStudent(student)}
                                  title="Edit Student"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive" title="Delete Student">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {student.full_name || student.email}? This action cannot be undone and will remove all their progress data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                        Delete
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <SubjectManagement />
          </TabsContent>
        </Tabs>

        {/* Edit Teacher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Teacher Allocation</DialogTitle>
              <DialogDescription>
                Update subject, class, and language allocation for {editingTeacher?.full_name || editingTeacher?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subjects *</Label>
                <div className="flex flex-wrap gap-2">
                  {activeSubjects.map((subject) => (
                    <div key={subject.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-subject-${subject.name}`}
                        checked={newTeacher.subjects.includes(subject.name)}
                        onCheckedChange={() => handleSubjectToggle(subject.name)}
                      />
                      <Label htmlFor={`edit-subject-${subject.name}`} className="text-sm font-normal cursor-pointer">
                        {subject.label_en}
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
                        id={`edit-class-${cls}`}
                        checked={newTeacher.classes.includes(cls)}
                        onCheckedChange={() => handleClassToggle(cls)}
                      />
                      <Label htmlFor={`edit-class-${cls}`} className="text-sm font-normal cursor-pointer">
                        Class {cls}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Languages *</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-lang-${lang}`}
                        checked={newTeacher.languages.includes(lang)}
                        onCheckedChange={() => handleLanguageToggle(lang)}
                      />
                      <Label htmlFor={`edit-lang-${lang}`} className="text-sm font-normal cursor-pointer capitalize">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleUpdateTeacher}
                disabled={submitting}
                className="w-full"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Allocation
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={isEditStudentDialogOpen} onOpenChange={setIsEditStudentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update details for {editingStudent?.full_name || editingStudent?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name</Label>
                <Input
                  id="student-name"
                  value={studentFormData.full_name}
                  onChange={(e) => setStudentFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter student name"
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={studentFormData.class} onValueChange={(v) => setStudentFormData(prev => ({ ...prev, class: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_CLASSES.map(cls => (
                      <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={studentFormData.language} onValueChange={(v) => setStudentFormData(prev => ({ ...prev, language: v as 'hindi' | 'english' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateStudent} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Teacher Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reset Teacher Password</DialogTitle>
              <DialogDescription>
                Set a new password for {resetPasswordTeacher?.full_name || resetPasswordTeacher?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-teacher-password">New Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="new-teacher-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newTeacherPassword}
                      onChange={(e) => setNewTeacherPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={6}
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
                  <Button type="button" variant="outline" onClick={generateResetPassword}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>
              <Button 
                onClick={handleResetTeacherPassword} 
                disabled={resettingPassword || !newTeacherPassword || newTeacherPassword.length < 6} 
                className="w-full"
              >
                {resettingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Reset Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
