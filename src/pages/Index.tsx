import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, WifiOff, Globe, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Language Selector - Positioned at top */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-soft">
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

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <BookOpen className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                शिक्षा सेतु
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Shiksha Setu - {t('bridgeToEducation')}
            </p>

            {/* Mission Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <WifiOff className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary">{t('offlineFirstLearning')}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {t('heroDescription')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/auth?role=student">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <GraduationCap className="h-6 w-6" />
                  {t('studentLogin')}
                </Button>
              </Link>
              <Link to="/auth?role=teacher">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-2 hover:bg-primary/5 transition-all">
                  <Users className="h-6 w-6" />
                  {t('teacherLogin')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('whyShikshaSetu')} <span className="text-primary">Shiksha Setu</span>?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <WifiOff className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('worksOffline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                {t('worksOfflineDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('hindiEnglish')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                {t('hindiEnglishDesc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <School className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('classes6to10')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
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
