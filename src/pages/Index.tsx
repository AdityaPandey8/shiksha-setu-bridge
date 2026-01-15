import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, WifiOff, Globe, School, Shield, Download, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          {/* Top Bar with Language */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-xl shadow-soft">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">शिक्षा सेतु</span>
            </div>
            
            <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-1.5 shadow-soft">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div className="flex">
                <Button
                  size="sm"
                  variant={language === 'en' ? 'default' : 'ghost'}
                  className={`rounded-full h-7 px-3 text-xs ${language === 'en' ? '' : 'text-muted-foreground'}`}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </Button>
                <Button
                  size="sm"
                  variant={language === 'hi' ? 'default' : 'ghost'}
                  className={`rounded-full h-7 px-3 text-xs ${language === 'hi' ? '' : 'text-muted-foreground'}`}
                  onClick={() => setLanguage('hi')}
                >
                  हिं
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <WifiOff className="h-4 w-4" />
              {t('offlineFirstLearning')}
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight animate-slide-up">
              {t('mainTagline')}
            </h1>
            
            {/* Sub-tagline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up stagger-1">
              {t('heroDescription')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up stagger-2">
              <Link to="/auth?role=student">
                <Button size="lg" className="gap-2 text-base px-8 h-12 shadow-soft w-full sm:w-auto">
                  <GraduationCap className="h-5 w-5" />
                  {t('studentLogin')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth?role=teacher">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12 border-2 w-full sm:w-auto">
                  <Users className="h-5 w-5" />
                  {t('teacherLogin')}
                </Button>
              </Link>
            </div>

            {/* Admin Link */}
            <Link to="/auth?role=admin" className="animate-fade-in stagger-3">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Shield className="h-4 w-4" />
                {language === 'hi' ? 'एडमिन' : 'Admin'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t('whyShikshaSetu')} <span className="text-gradient">Shiksha Setu</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('secondaryValueStatement')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: WifiOff, title: t('worksOffline'), desc: t('worksOfflineDesc'), color: 'bg-primary/10 text-primary' },
              { icon: Download, title: t('focusMode'), desc: t('focusModeDesc'), color: 'bg-secondary/10 text-secondary' },
              { icon: Globe, title: t('hindiEnglish'), desc: t('hindiEnglishDesc'), color: 'bg-accent/10 text-accent' },
              { icon: School, title: t('classes6to10'), desc: t('classes6to10Desc'), color: 'bg-success/10 text-success' },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="card-hover border-0 shadow-soft animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('howItWorks')} <span className="text-gradient">{t('works')}</span>
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-4xl mx-auto">
            {[
              { step: 1, title: t('connectOnline'), desc: t('connectOnlineDesc') },
              { step: 2, title: t('learnOffline'), desc: t('learnOfflineDesc') },
              { step: 3, title: t('syncProgress'), desc: t('syncProgressDesc') },
            ].map((item, index) => (
              <div key={index} className="flex-1 relative">
                <Card className="h-full border-0 shadow-soft card-hover text-center p-6">
                  <div className="w-14 h-14 gradient-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-soft">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </Card>
                
                {/* Connector */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{t('worksOffline')}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{t('hindiEnglish')}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{t('classes6to10')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Shiksha Setu</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('footerTagline')}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            {t('builtForStudents')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
