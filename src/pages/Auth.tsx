import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Users, ArrowLeft, Loader2, Shield, WifiOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { supabase } from '@/integrations/supabase/client';

type Role = 'student' | 'teacher' | 'admin';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role: userRole, signIn, signUp, loading: authLoading } = useAuth();
  const { t, language: preferredLanguage } = useLanguage();
  const { isOnline, validateOfflineLogin, saveOfflineCredentials, getOfflineAuthData, isOfflineLoginEnabled } = useOfflineAuth();

  const initialRole = (searchParams.get('role') as Role) || 'student';
  const [role, setRole] = useState<Role>(initialRole);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedClass, setSelectedClass] = useState('8');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, userRole, authLoading, navigate]);

  // Check for active offline session
  useEffect(() => {
    if (!isOnline && !user) {
      const offlineData = getOfflineAuthData();
      const activeOfflineSession = localStorage.getItem('offlineSessionActive');
      
      if (offlineData && activeOfflineSession === 'true') {
        if (offlineData.userRole === 'admin') navigate('/admin');
        else if (offlineData.userRole === 'teacher') navigate('/teacher');
        else navigate('/student');
      }
    }
  }, [isOnline, user, navigate, getOfflineAuthData]);

  // Admin and Teacher can only login
  useEffect(() => {
    if (role === 'admin' || role === 'teacher') {
      setIsLogin(true);
    }
  }, [role]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Password reset requires internet connection',
      });
      return;
    }
    
    if (!email) {
      toast({ variant: 'destructive', title: t('error'), description: t('enterEmail') });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({ variant: 'destructive', title: t('error'), description: error.message });
      } else {
        toast({ title: t('success'), description: 'Check your email for a password reset link.' });
        setIsForgotPassword(false);
      }
    } catch {
      toast({ variant: 'destructive', title: t('error'), description: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineLogin = () => {
    const validation = validateOfflineLogin(email, role);
    
    if (!validation.valid) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'First login requires internet connection',
      });
      return;
    }

    localStorage.setItem('offlineSessionActive', 'true');
    toast({ title: 'Offline Login', description: 'Logged in using saved access' });

    if (validation.userData?.userRole === 'admin') navigate('/admin');
    else if (validation.userData?.userRole === 'teacher') navigate('/teacher');
    else navigate('/student');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      handleOfflineLogin();
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        if (error) {
          toast({ variant: 'destructive', title: t('error'), description: error.message });
        } else if (data?.user) {
          const { data: roleData } = await supabase
            .from('user_roles').select('role').eq('user_id', data.user.id).maybeSingle();
          const { data: profileData } = await supabase
            .from('profiles').select('full_name, class').eq('id', data.user.id).maybeSingle();

          saveOfflineCredentials({
            userId: data.user.id,
            email: data.user.email || email,
            name: profileData?.full_name || null,
            role: roleData?.role as Role || 'student',
            class: profileData?.class || null,
          });
          
          toast({ title: t('welcomeBack') + '!', description: 'Successfully logged in.' });
        }
      } else {
        if (role === 'teacher') {
          toast({ variant: 'destructive', title: t('error'), description: 'Teacher accounts can only be created by Admin.' });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          role,
          class: role === 'student' ? selectedClass : undefined,
          language: preferredLanguage === 'hi' ? 'hindi' : 'english',
        });

        if (error) {
          toast({ variant: 'destructive', title: t('error'), description: error.message });
        } else {
          toast({ title: t('success') + '!', description: 'Welcome to Shiksha Setu.' });
        }
      }
    } catch {
      toast({ variant: 'destructive', title: t('error'), description: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (r: Role) => {
    if (r === 'admin') return 'Admin';
    return r === 'student' ? t('student') : t('teacher');
  };

  const canOfflineLogin = isOfflineLoginEnabled();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">Shiksha Setu</span>
          </Link>
          
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToHome')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Offline Alert */}
          {!isOnline && (
            <Alert className="mb-6 border-warning/50 bg-warning/10">
              <WifiOff className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                {canOfflineLogin ? 'Offline Mode – Login using saved access' : 'First login requires internet'}
              </AlertDescription>
            </Alert>
          )}

          {/* Role Selector */}
          {!isForgotPassword && role !== 'admin' && (
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="student" className="gap-2 text-sm">
                  <GraduationCap className="h-4 w-4" />
                  {t('student')}
                </TabsTrigger>
                <TabsTrigger value="teacher" className="gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {t('teacher')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Auth Card */}
          <Card className="shadow-elevated border-0">
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto p-3 rounded-2xl mb-3 ${
                role === 'admin' ? 'bg-destructive/10' : role === 'student' ? 'bg-primary/10' : 'bg-secondary/10'
              }`}>
                {role === 'admin' ? (
                  <Shield className="h-7 w-7 text-destructive" />
                ) : role === 'student' ? (
                  <GraduationCap className="h-7 w-7 text-primary" />
                ) : (
                  <Users className="h-7 w-7 text-secondary" />
                )}
              </div>
              <CardTitle className="text-xl">
                {isForgotPassword ? t('resetPassword') : isLogin ? t('welcomeBack') : t('createAccount')}
              </CardTitle>
              <CardDescription>
                {isForgotPassword ? t('enterEmailForReset') : isLogin 
                  ? `Login as ${getRoleName(role)}` 
                  : `Create ${getRoleName(role)} account`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('enterEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={!isOnline}
                      className="h-11"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading || !isOnline}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('sendResetLink')}
                  </Button>

                  <div className="text-center">
                    <Button variant="link" onClick={() => setIsForgotPassword(false)} className="text-sm">
                      {t('backToLogin')}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('fullName')}</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={t('enterFullName')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={!isOnline}
                        className="h-11"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('enterEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('password')}</Label>
                      {isLogin && isOnline && (
                        <Button
                          variant="link"
                          type="button"
                          className="h-auto p-0 text-xs text-muted-foreground"
                          onClick={() => setIsForgotPassword(true)}
                        >
                          {t('forgotPassword')}
                        </Button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('enterPassword')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isOnline}
                      minLength={6}
                      className="h-11"
                    />
                  </div>

                  {!isLogin && role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="class">{t('class')}</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass} disabled={!isOnline}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('selectClass')} />
                        </SelectTrigger>
                        <SelectContent>
                          {['6', '7', '8', '9', '10'].map(c => (
                            <SelectItem key={c} value={c}>{t('class')} {c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {!isOnline && <WifiOff className="h-4 w-4 mr-2" />}
                    {isLogin ? t('login') : t('signUp')}
                  </Button>

                  {/* Toggle Login/Signup */}
                  {role === 'student' && (
                    <div className="text-center text-sm text-muted-foreground">
                      {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
                      <Button
                        variant="link"
                        type="button"
                        className="h-auto p-0 text-primary font-medium"
                        onClick={() => setIsLogin(!isLogin)}
                        disabled={!isOnline && !isLogin}
                      >
                        {isLogin ? t('signUp') : t('login')}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
