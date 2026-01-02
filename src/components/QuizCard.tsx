/**
 * QuizCard Component
 * 
 * Displays a quiz question with instant client-side evaluation.
 * 
 * OFFLINE EVALUATION:
 * - Correct answer is stored in quiz data (correctAnswer field)
 * - Evaluation happens instantly on client side
 * - No server round-trip needed for feedback
 * 
 * SYNC STATUS:
 * - Shows "Answered" when attempt is saved
 * - Shows "Pending Sync" when offline and awaiting sync
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  isOnline?: boolean; // For showing sync status
}

export function QuizCard({
  id,
  question,
  options,
  correctAnswer,
  language,
  onSubmit,
  alreadyAttempted = false,
  isOnline = true,
}: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  /**
   * INSTANT EVALUATION LOGIC:
   * - Compares selected answer with correctAnswer stored in quiz data
   * - No server call needed - works fully offline
   * - Stores attempt locally and triggers sync callback
   */
  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    // Client-side evaluation - instant, no server needed
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);

    // Callback to parent for local storage + sync handling
    if (onSubmit) {
      onSubmit(id, selectedAnswer, correct);
    }
  };

  // Already attempted - show completed state
  if (alreadyAttempted) {
    return (
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                ✓ Answered
              </Badge>
            </div>
            <Badge variant="outline" className="capitalize text-xs">
              {language}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2 text-muted-foreground">{question}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${
      submitted 
        ? isCorrect 
          ? 'border-success/50 bg-success/5 shadow-lg shadow-success/10' 
          : 'border-destructive/50 bg-destructive/5 shadow-lg shadow-destructive/10'
        : 'hover:shadow-md'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline">Quiz</Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Sync status indicator - shows after submission */}
            {submitted && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  isOnline 
                    ? 'bg-success/10 text-success border-success/20' 
                    : 'bg-warning/10 text-warning border-warning/20'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Synced
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Sync
                  </>
                )}
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize text-xs">
              {language}
            </Badge>
          </div>
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
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                submitted
                  ? index === correctAnswer
                    ? 'border-success bg-success/10 ring-2 ring-success/30'
                    : index === selectedAnswer
                    ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/30'
                    : 'border-border opacity-50'
                  : selectedAnswer === index
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`${id}-option-${index}`} />
              <Label
                htmlFor={`${id}-option-${index}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {option}
              </Label>
              {/* Show check/cross icons after submission */}
              {submitted && index === correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-success animate-in zoom-in duration-300" />
              )}
              {submitted && index === selectedAnswer && index !== correctAnswer && (
                <XCircle className="h-5 w-5 text-destructive animate-in zoom-in duration-300" />
              )}
            </div>
          ))}
        </RadioGroup>

        {/* Submit button - disabled after answering */}
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full font-semibold"
            size="lg"
          >
            Submit Answer
          </Button>
        ) : (
          /* Instant feedback message */
          <div className={`p-4 rounded-lg text-center font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            isCorrect 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}>
            {isCorrect ? (
              <div className="space-y-1">
                <p className="text-lg">✅ Correct Answer!</p>
                <p className="text-sm opacity-80">Great job! You chose the right answer.</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg">❌ Wrong Answer</p>
                <p className="text-sm opacity-80">Oops! That's not correct. The right answer is shown above.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
