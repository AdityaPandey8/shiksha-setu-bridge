import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Bell, LogOut, Loader2, Save, WifiOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { AvatarUpload } from '@/components/AvatarUpload';
import { SubjectSelector } from '@/components/SubjectSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

const SETTINGS_STORAGE_KEY = 'shiksha_setu_user_settings';
const PENDING_PASSWORD_KEY = 'shiksha_setu_pending_password';

interface UserSettings {
  emailNotifications: boolean;
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, role, signOut, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({ emailNotifications: true });
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try { setSettings(JSON.parse(savedSettings)); } catch { /* ignore */ }
    }
    const pendingPassword = localStorage.getItem(PENDING_PASSWORD_KEY);
    if (pendingPassword) setHasPendingChanges(true);
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }, [profile]);

  useEffect(() => {
    if (isOnline && hasPendingChanges) syncPendingPassword();
  }, [isOnline, hasPendingChanges]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const syncPendingPassword = async () => {
    const pendingPassword = localStorage.getItem(PENDING_PASSWORD_KEY);
    if (!pendingPassword) return;
    try {
      const { error } = await supabase.auth.updateUser({ password: pendingPassword });
      if (error) throw error;
      localStorage.removeItem(PENDING_PASSWORD_KEY);
      setHasPendingChanges(false);
      toast({ title: t('passwordSynced'), description: t('passwordSyncedDesc') });
    } catch (error) { console.error('Error syncing password:', error); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: t('error'), description: t('passwordMinLength') });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: t('error'), description: t('passwordsDoNotMatch') });
      return;
    }
    setSavingPassword(true);
    if (isOnline) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: t('success'), description: t('passwordUpdated') });
        setNewPassword(''); setConfirmPassword('');
      } catch (error: any) {
        toast({ variant: 'destructive', title: t('error'), description: error.message || t('passwordUpdateFailed') });
      }
    } else {
      localStorage.setItem(PENDING_PASSWORD_KEY, newPassword);
      setHasPendingChanges(true);
      toast({ title: t('passwordSavedOffline'), description: t('passwordWillSyncOnline') });
      setNewPassword(''); setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    const newSettings = { ...settings, emailNotifications: enabled };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    toast({ title: t('settingsSaved'), description: enabled ? t('notificationsEnabled') : t('notificationsDisabled') });
  };

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    navigate('/');
  };

  const getBackPath = () => {
    switch (role) {
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      default: return '/student';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'teacher': return t('teacher');
      case 'admin': return 'Admin';
      default: return t('student');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />{t('offlineModeChangesWillSync')}
        </div>
      )}

      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(getBackPath())}><ArrowLeft className="h-5 w-5" /></Button>
              <div className="p-2 rounded-lg bg-primary/10"><User className="h-5 w-5 text-primary" /></div>
              <div>
                <h1 className="text-lg font-bold">{t('profileSettings')}</h1>
                <p className="text-sm text-muted-foreground">{t('manageYourAccount')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Badge variant={isOnline ? 'default' : 'secondary'}>{isOnline ? t('online') : t('offline')}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {hasPendingChanges && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
            {t('pendingChangesWillSync')}
          </div>
        )}

        <div className="space-y-6">
          {/* User Details with Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />{t('userDetails')}</CardTitle>
              <CardDescription>{t('yourAccountInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <AvatarUpload currentAvatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} size="lg" />
                <div className="grid gap-4 sm:grid-cols-2 flex-1">
                  <div className="space-y-2"><Label className="text-muted-foreground">{t('fullName')}</Label><p className="font-medium">{profile?.full_name || '-'}</p></div>
                  <div className="space-y-2"><Label className="text-muted-foreground">{t('email')}</Label><p className="font-medium">{user?.email || '-'}</p></div>
                  <div className="space-y-2"><Label className="text-muted-foreground">{t('role')}</Label><Badge variant="outline">{getRoleLabel()}</Badge></div>
                  {profile?.class && <div className="space-y-2"><Label className="text-muted-foreground">{t('class')}</Label><p className="font-medium">{t('class')} {profile.class}</p></div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Selection for Students */}
          {role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />My Subjects</CardTitle>
                <CardDescription>Select the subjects you want to learn</CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectSelector showTitle={false} />
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />{t('changePassword')}</CardTitle><CardDescription>{t('updateYourPassword')}</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="newPassword">{t('newPassword')}</Label><Input id="newPassword" type="password" placeholder={t('enterNewPassword')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} /></div>
                <div className="space-y-2"><Label htmlFor="confirmPassword">{t('confirmPassword')}</Label><Input id="confirmPassword" type="password" placeholder={t('confirmNewPassword')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} /></div>
                <p className="text-xs text-muted-foreground">{t('passwordRequirements')}</p>
                <Button type="submit" disabled={savingPassword || !newPassword || !confirmPassword}>{savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}{t('savePassword')}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t('emailNotifications')}</CardTitle><CardDescription>{t('emailNotificationsDesc')}</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="font-medium">{t('receiveEmailNotifications')}</p><p className="text-sm text-muted-foreground">{t('emailNotificationsHint')}</p></div>
                <Switch checked={settings.emailNotifications} onCheckedChange={handleNotificationToggle} />
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="border-destructive/50">
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><LogOut className="h-5 w-5" />{t('logout')}</CardTitle><CardDescription>{t('logoutDescription')}</CardDescription></CardHeader>
            <CardContent><Button variant="destructive" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />{t('logoutButton')}</Button></CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
