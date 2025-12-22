import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Users, Wifi, WifiOff, Globe, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
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
              Shiksha Setu - Bridge to Education
            </p>

            {/* Mission Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 max-w-2xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <WifiOff className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary">Offline-First Learning</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                Ensuring <span className="font-semibold text-primary">uninterrupted learning</span> for students in 
                Kashmir, Ladakh, North-East, tribal areas, and border villages — 
                <span className="font-semibold"> even without internet connectivity</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/auth?role=student">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <GraduationCap className="h-6 w-6" />
                  Student Login
                </Button>
              </Link>
              <Link to="/auth?role=teacher">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-2 hover:bg-primary/5 transition-all">
                  <Users className="h-6 w-6" />
                  Teacher Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why <span className="text-primary">Shiksha Setu</span>?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <WifiOff className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Works Offline</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Download lessons once and access them anytime, anywhere — no internet required. Perfect for remote areas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Hindi & English</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Content available in both Hindi and English to support students from diverse linguistic backgrounds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-xl w-fit mb-2">
                <School className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Classes 6-10</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-base">
                Curated educational content aligned with the curriculum for middle and high school students.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It <span className="text-primary">Works</span>
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect Online</h3>
              <p className="text-muted-foreground">Download lessons and quizzes when you have internet access</p>
            </div>
            
            <div className="hidden md:block w-24 h-0.5 bg-primary/30" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Learn Offline</h3>
              <p className="text-muted-foreground">Study anytime, even without connectivity</p>
            </div>
            
            <div className="hidden md:block w-24 h-0.5 bg-primary/30" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Sync Progress</h3>
              <p className="text-muted-foreground">Your progress syncs automatically when you're back online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Shiksha Setu — Bridging the Digital Divide in Education</span>
        </p>
        <p className="mt-2 text-sm">
          Built for students in remote India 🇮🇳
        </p>
      </footer>
    </div>
  );
};

export default Index;
