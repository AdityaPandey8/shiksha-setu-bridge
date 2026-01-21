/**
 * SubjectPromptBanner Component
 * 
 * Shows a prompt when student has not selected any subjects.
 * Includes a button to open the subject selector dialog.
 */

import { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SubjectSelector } from '@/components/SubjectSelector';
import { useLanguage } from '@/hooks/useLanguage';

interface SubjectPromptBannerProps {
  onSubjectsSelected?: () => void;
}

export function SubjectPromptBanner({ onSubjectsSelected }: SubjectPromptBannerProps) {
  const { language } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleComplete = () => {
    setDialogOpen(false);
    onSubjectsSelected?.();
  };

  return (
    <>
      <Card className="border-warning/50 bg-warning/5 mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <BookOpen className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-warning">
                  {language === 'hi' ? 'अपने विषय चुनें' : 'Choose Your Subjects'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'hi' 
                    ? 'व्यक्तिगत सामग्री देखने के लिए अपने विषय चुनें।'
                    : 'Select your subjects to see personalized content.'}
                </p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="shrink-0">
              {language === 'hi' ? 'चुनें' : 'Select'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'hi' ? 'अपने विषय चुनें' : 'Choose Your Subjects'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' 
                ? 'उन विषयों का चयन करें जिन्हें आप सीखना चाहते हैं।'
                : 'Select the subjects you want to learn.'}
            </DialogDescription>
          </DialogHeader>
          <SubjectSelector onComplete={handleComplete} showTitle={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}
