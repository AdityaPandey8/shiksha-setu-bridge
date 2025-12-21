import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizCardProps {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  language: 'hindi' | 'english';
  onSubmit?: (quizId: string, selectedAnswer: number, isCorrect: boolean) => void;
  alreadyAttempted?: boolean;
}

export function QuizCard({
  id,
  question,
  options,
  correctAnswer,
  language,
  onSubmit,
  alreadyAttempted = false,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);

    if (onSubmit) {
      onSubmit(id, selectedAnswer, correct);
    }
  };

  if (alreadyAttempted) {
    return (
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <Badge variant="secondary">Already Attempted</Badge>
          </div>
          <CardTitle className="text-lg">{question}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${
      submitted 
        ? isCorrect 
          ? 'border-success/50 bg-success/5' 
          : 'border-destructive/50 bg-destructive/5'
        : ''
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline">Quiz</Badge>
          </div>
          <Badge variant="secondary" className="capitalize">
            {language}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => setSelectedAnswer(parseInt(value))}
          disabled={submitted}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                submitted
                  ? index === correctAnswer
                    ? 'border-success bg-success/10'
                    : index === selectedAnswer
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border'
                  : selectedAnswer === index
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`${id}-option-${index}`} />
              <Label
                htmlFor={`${id}-option-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </Label>
              {submitted && index === correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
              {submitted && index === selectedAnswer && index !== correctAnswer && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </RadioGroup>

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full"
          >
            Submit Answer
          </Button>
        ) : (
          <div className={`p-4 rounded-lg text-center font-medium ${
            isCorrect 
              ? 'bg-success/10 text-success' 
              : 'bg-destructive/10 text-destructive'
          }`}>
            {isCorrect ? '🎉 Correct!' : '❌ Incorrect. Keep learning!'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
