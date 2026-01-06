import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, WifiOff, Globe, School, Shield, Focus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <header className="relative">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Language Selector */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 bg-card border rounded-full px-4 py-2 shadow-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{t('selectLanguage')}:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={language === 'en' ? 'default' : 'ghost'}
                  className={`rounded-full px-4 text-sm ${language === 'en' ? '' : 'text-muted-foreground'}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </Button>
                <Button
                  size="sm"
                  variant={language === 'hi' ? 'default' : 'ghost'}
                  className={`rounded-full px-4 text-sm ${language === 'hi' ? '' : 'text-muted-foreground'}`}
                  onClick={() => setLanguage('hi')}
                >
                  हिंदी
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary rounded-2xl shadow-md">
                <BookOpen className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                शिक्षा सेतु
              </h1>
            </div>
            
            {/* Main Tagline */}
            <p className="text-2xl md:text-3xl font-semibold text-primary mb-2">
              Shiksha Setu — {t('mainTagline')}
            </p>
            
            {/* Sub-tagline */}
            <p className="text-lg text-muted-foreground mb-8">
              {t('subTagline')}
            </p>

            {/* Main Feature Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 max-w-2xl w-full">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary">{t('offlineFirstLearning')}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {t('heroDescription')}
              </p>
            </div>

            {/* Secondary Value Statement */}
            <p className="text-base text-muted-foreground mb-4 max-w-xl">
              {t('secondaryValueStatement')}
            </p>

            {/* Focus Mode Explanation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 bg-secondary/50 px-4 py-2 rounded-full">
              <Download className="h-4 w-4" />
              <span>{t('focusModeExplanation')}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link to="/auth?role=student">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-md">
                  <GraduationCap className="h-6 w-6" />
                  {t('studentLogin')}
                </Button>
              </Link>
              <Link to="/auth?role=teacher">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-2">
                  <Users className="h-6 w-6" />
                  {t('teacherLogin')}
                </Button>
              </Link>
            </div>

            {/* Admin Login */}
            <div className="mb-8">
              <Link to="/auth?role=admin">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                  <Shield className="h-4 w-4" />
                  {language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {t('whyShikshaSetu')} <span className="text-primary">Shiksha Setu</span>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          <Card className="border hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <WifiOff className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-base">{t('worksOffline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {t('worksOfflineDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <Focus className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-base">{t('focusMode')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {t('focusModeDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-base">{t('hindiEnglish')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {t('hindiEnglishDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/40 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <School className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-base">{t('classes6to10')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {t('classes6to10Desc')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('howItWorks')} <span className="text-primary">{t('works')}</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('connectOnline')}</h3>
              <p className="text-muted-foreground">{t('connectOnlineDesc')}</p>
            </div>
            
            <div className="hidden md:block w-24 h-0.5 bg-primary/30" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('learnOffline')}</h3>
              <p className="text-muted-foreground">{t('learnOfflineDesc')}</p>
            </div>
            
            <div className="hidden md:block w-24 h-0.5 bg-primary/30" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('syncProgress')}</h3>
              <p className="text-muted-foreground">{t('syncProgressDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>{t('footerTagline')}</span>
        </p>
        <p className="mt-2 text-sm">
          {t('builtForStudents')}
        </p>
      </footer>
    </div>
  );
};

export default Index;
