/**
 * SubjectSelector Component
 * 
 * A multi-select component for students to choose their subjects.
 * Can be used in a modal on first login or in settings.
 */

import { useState, useEffect } from 'react';
import { Check, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudentSubjects } from '@/hooks/useStudentSubjects';
import { useLanguage } from '@/hooks/useLanguage';

interface SubjectSelectorProps {
  onComplete?: () => void;
  showTitle?: boolean;
}

export function SubjectSelector({ onComplete, showTitle = true }: SubjectSelectorProps) {
  const { activeSubjects, loading: subjectsLoading } = useSubjects();
  const { selectedSubjects, saveSelectedSubjects, saving } = useStudentSubjects();
  const { language } = useLanguage();
  const [localSelection, setLocalSelection] = useState<string[]>([]);

  // Initialize local selection from stored subjects
  useEffect(() => {
    setLocalSelection(selectedSubjects);
  }, [selectedSubjects]);

  const handleToggleSubject = (subjectName: string) => {
    setLocalSelection(prev => 
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSave = async () => {
    await saveSelectedSubjects(localSelection);
    onComplete?.();
  };

  const getSubjectLabel = (subject: { label_en: string; label_hi: string }) => {
    return language === 'hi' ? subject.label_hi : subject.label_en;
  };

  if (subjectsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {language === 'hi' ? 'अपने विषय चुनें' : 'Choose Your Subjects'}
          </CardTitle>
          <CardDescription>
            {language === 'hi' 
              ? 'उन विषयों का चयन करें जिन्हें आप सीखना चाहते हैं। आप इसे बाद में बदल सकते हैं।'
              : 'Select the subjects you want to learn. You can change this later.'}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activeSubjects.map((subject) => {
            const isSelected = localSelection.includes(subject.name);
            return (
              <div
                key={subject.id}
                onClick={() => handleToggleSubject(subject.name)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'}
                `}
              >
                <Checkbox
                  id={`subject-${subject.id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleSubject(subject.name)}
                />
                <Label 
                  htmlFor={`subject-${subject.id}`}
                  className="cursor-pointer flex-1 text-sm font-medium"
                >
                  {getSubjectLabel(subject)}
                </Label>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            );
          })}
        </div>

        {localSelection.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {language === 'hi' 
              ? 'कृपया कम से कम एक विषय चुनें'
              : 'Please select at least one subject'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || localSelection.length === 0}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {language === 'hi' ? 'सहेजें' : 'Save Subjects'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
