import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft,
  Share,
  MoreVertical
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const isHindi = language === 'hi';

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: WifiOff,
      title: isHindi ? 'ऑफलाइन पढ़ाई' : 'Study Offline',
      description: isHindi 
        ? 'बिना इंटरनेट के ई-बुक्स और क्विज़ पढ़ें' 
        : 'Access ebooks and quizzes without internet'
    },
    {
      icon: Smartphone,
      title: isHindi ? 'फोन पर ऐप जैसा' : 'App-like Experience',
      description: isHindi 
        ? 'होम स्क्रीन से सीधे खोलें' 
        : 'Open directly from your home screen'
    },
    {
      icon: BookOpen,
      title: isHindi ? 'तेज़ लोडिंग' : 'Fast Loading',
      description: isHindi 
        ? 'कैश्ड कंटेंट तुरंत लोड होता है' 
        : 'Cached content loads instantly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isHindi ? 'ऐप इंस्टॉल करें' : 'Install App'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Shiksha Setu - शिक्षा सेतु
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant={isOnline ? 'default' : 'secondary'} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline 
              ? (isHindi ? 'ऑनलाइन' : 'Online') 
              : (isHindi ? 'ऑफलाइन' : 'Offline')}
          </Badge>
        </div>

        {/* Already Installed */}
        {isInstalled ? (
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  {isHindi ? 'ऐप इंस्टॉल है!' : 'App Installed!'}
                </h2>
                <p className="text-green-700">
                  {isHindi 
                    ? 'शिक्षा सेतु आपके होम स्क्रीन पर है' 
                    : 'Shiksha Setu is on your home screen'}
                </p>
                <Button onClick={() => navigate('/auth')} className="mt-4">
                  {isHindi ? 'लॉगिन करें' : 'Login Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Install Button (Android/Chrome) */}
            {deferredPrompt && (
              <Card className="border-blue-200 bg-blue-50 mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Download className="h-12 w-12 text-blue-500 mb-4" />
                    <Button onClick={handleInstall} size="lg" className="gap-2">
                      <Download className="h-5 w-5" />
                      {isHindi ? 'अभी इंस्टॉल करें' : 'Install Now'}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isHindi ? 'फ्री, कोई स्टोर नहीं' : 'Free, no app store needed'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {isHindi ? 'iPhone पर इंस्टॉल करें' : 'Install on iPhone'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">1</div>
                    <div>
                      <p className="font-medium">
                        {isHindi ? 'Share बटन दबाएं' : 'Tap Share button'}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Share className="h-4 w-4" />
                        {isHindi ? 'नीचे के मेनू में' : 'At the bottom of Safari'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">2</div>
                    <div>
                      <p className="font-medium">
                        {isHindi ? '"Add to Home Screen" चुनें' : 'Select "Add to Home Screen"'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">3</div>
                    <div>
                      <p className="font-medium">
                        {isHindi ? '"Add" पर टैप करें' : 'Tap "Add"'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions (fallback) */}
            {isAndroid && !deferredPrompt && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {isHindi ? 'Android पर इंस्टॉल करें' : 'Install on Android'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">1</div>
                    <div>
                      <p className="font-medium">
                        {isHindi ? 'मेनू खोलें' : 'Open browser menu'}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MoreVertical className="h-4 w-4" />
                        {isHindi ? 'ऊपर दाईं ओर' : 'Top right corner'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">2</div>
                    <div>
                      <p className="font-medium">
                        {isHindi ? '"Install app" या "Add to Home screen" चुनें' : 'Select "Install app" or "Add to Home screen"'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Features */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-700">
            {isHindi ? 'ऐप के फायदे' : 'App Benefits'}
          </h3>
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue without installing */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/auth')}>
            {isHindi ? 'बिना इंस्टॉल जारी रखें' : 'Continue without installing'}
          </Button>
        </div>
      </div>
    </div>
  );
}
