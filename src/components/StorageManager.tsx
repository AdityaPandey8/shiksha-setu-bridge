import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  FileQuestion, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useStorageStats } from '@/hooks/useIndexedDB';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function StorageManager() {
  const { stats, clearCache, clearOld } = useStorageStats();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const isHindi = language === 'hi';

  const handleClearOld = async () => {
    setIsClearing(true);
    try {
      await clearOld(30);
      toast({
        title: isHindi ? 'पुरानी कैश साफ' : 'Old cache cleared',
        description: isHindi 
          ? '30 दिन से पुरानी फाइलें हटा दी गईं' 
          : 'Files older than 30 days have been removed',
      });
    } catch (error) {
      toast({
        title: isHindi ? 'त्रुटि' : 'Error',
        description: isHindi ? 'कैश साफ नहीं हुई' : 'Failed to clear cache',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      toast({
        title: isHindi ? 'सभी कैश साफ' : 'All cache cleared',
        description: isHindi 
          ? 'सभी ऑफलाइन डेटा हटा दिया गया' 
          : 'All offline data has been removed',
      });
    } catch (error) {
      toast({
        title: isHindi ? 'त्रुटि' : 'Error',
        description: isHindi ? 'कैश साफ नहीं हुई' : 'Failed to clear cache',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const totalItems = stats.ebooks + stats.quizzes + stats.content + stats.chatbotSummaries;
  const storageUsedMB = stats.totalEbookSizeMB;
  const maxStorageMB = 500;
  const usagePercent = Math.min((storageUsedMB / maxStorageMB) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          {isHindi ? 'ऑफलाइन स्टोरेज' : 'Offline Storage'}
        </CardTitle>
        <CardDescription>
          {isHindi 
            ? 'डाउनलोड की गई सामग्री प्रबंधित करें' 
            : 'Manage downloaded content'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{isHindi ? 'उपयोग' : 'Usage'}</span>
            <span className="font-medium">{storageUsedMB} MB</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {totalItems} {isHindi ? 'आइटम कैश्ड' : 'items cached'}
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{stats.ebooks}</p>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'ई-बुक्स' : 'Ebooks'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <FileQuestion className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{stats.quizzes}</p>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'क्विज़' : 'Quizzes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">{stats.chatbotSummaries}</p>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'सारांश' : 'Summaries'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <HardDrive className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">{storageUsedMB} MB</p>
              <p className="text-xs text-muted-foreground">
                {isHindi ? 'कुल साइज़' : 'Total Size'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleClearOld}
            disabled={isClearing}
          >
            <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isHindi ? 'पुरानी कैश साफ करें (30 दिन)' : 'Clear old cache (30 days)'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full gap-2"
                disabled={isClearing || totalItems === 0}
              >
                <Trash2 className="h-4 w-4" />
                {isHindi ? 'सभी कैश साफ करें' : 'Clear all cache'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {isHindi ? 'क्या आप सुनिश्चित हैं?' : 'Are you sure?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isHindi 
                    ? 'यह सभी डाउनलोड की गई सामग्री को हटा देगा। आपको फिर से डाउनलोड करना होगा।' 
                    : 'This will remove all downloaded content. You will need to download again.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  {isHindi ? 'हां, साफ करें' : 'Yes, clear all'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Warning */}
        {usagePercent > 80 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              {isHindi 
                ? 'स्टोरेज लगभग भर गया है। पुरानी फाइलें हटाएं।' 
                : 'Storage is almost full. Consider clearing old files.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
