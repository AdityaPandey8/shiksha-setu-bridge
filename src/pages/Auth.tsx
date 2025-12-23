import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { MissionBanner } from '@/components/MissionBanner';
import { supabase } from '@/integrations/supabase/client';

type Role = 'student' | 'teacher';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role: userRole, signIn, signUp, loading: authLoading } = useAuth();
  const { t, language: preferredLanguage } = useLanguage();

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
  // Language is now read from global preference (useLanguage hook)
  // Remove language selector from signup form

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [user, userRole, authLoading, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('enterEmail'),
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: error.message,
        });
      } else {
        toast({
          title: t('success'),
          description: 'Check your email for a password reset link.',
        });
        setIsForgotPassword(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: 'destructive',
            title: t('error'),
            description: error.message,
          });
        } else {
          toast({
            title: t('welcomeBack') + '!',
            description: 'You have successfully logged in.',
          });
        }
      } else {
        // Use global language preference for signup
        const { error } = await signUp(email, password, {
          full_name: fullName,
          role,
          class: role === 'student' ? selectedClass : undefined,
          language: preferredLanguage === 'hi' ? 'hindi' : 'english',
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: t('error'),
              description: 'This email is already registered. Please login instead.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: t('error'),
              description: error.message,
            });
          }
        } else {
          toast({
            title: t('success') + '!',
            description: 'Welcome to Shiksha Setu.',
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (role === 'student') {
      setEmail('student@demo.com');
      setPassword('demo123');
    } else {
      setEmail('teacher@demo.com');
      setPassword('demo123');
    }
  };

  // Get translated role name
  const getRoleName = (r: Role) => r === 'student' ? t('student') : t('teacher');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MissionBanner />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (isForgotPassword) {
              setIsForgotPassword(false);
            } else {
              navigate('/');
            }
          }}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isForgotPassword ? t('backToLogin') : t('backToHome')}
        </Button>

        <div className="max-w-md mx-auto">
          {/* Role Selector - hide during forgot password */}
          {!isForgotPassword && (
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t('student')}
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('teacher')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Card className="shadow-soft">
            <CardHeader className="text-center">
              <div className={`mx-auto p-3 rounded-full ${
                role === 'student' ? 'bg-primary/10' : 'bg-accent/10'
              } mb-2`}>
                {role === 'student' ? (
                  <GraduationCap className={`h-6 w-6 ${role === 'student' ? 'text-primary' : 'text-accent'}`} />
                ) : (
                  <Users className="h-6 w-6 text-accent" />
                )}
              </div>
              <CardTitle>
                {isForgotPassword 
                  ? t('resetPassword') 
                  : isLogin 
                    ? t('welcomeBack') 
                    : t('createAccount')}
              </CardTitle>
              <CardDescription>
                {isForgotPassword
                  ? t('enterEmailForReset')
                  : isLogin 
                    ? t('loginToAccount', { role: getRoleName(role) })
                    : t('signUpAs', { role: getRoleName(role) })}
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
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t('sendResetLink')}
                  </Button>

                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-sm"
                    >
                      {t('backToLogin')}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
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
                          required={!isLogin}
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
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('password')}</Label>
                        {isLogin && (
                          <Button
                            type="button"
                            variant="link"
                            className="text-xs p-0 h-auto"
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
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Only show class selector for students, removed language selector */}
                    {role === 'student' && !isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="class">{t('selectClass')}</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectClass')} />
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
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isLogin ? t('login') : t('createAccount')}
                    </Button>
                  </form>

                  <div className="mt-4 text-center space-y-2">
                    <Button
                      variant="link"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm"
                    >
                      {isLogin 
                        ? t('dontHaveAccount')
                        : t('alreadyHaveAccount')}
                    </Button>

                    {isLogin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fillDemoCredentials}
                        className="text-xs text-muted-foreground"
                      >
                        {t('useDemoCredentials')}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
