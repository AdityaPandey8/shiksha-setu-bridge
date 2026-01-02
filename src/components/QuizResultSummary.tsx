/**
 * QuizResultSummary Component
 * 
 * Displays a summary of quiz performance including:
 * - Total questions attempted
 * - Correct/Wrong counts
 * - Score percentage
 * - Performance badge (Excellent/Needs Practice/Keep Learning)
 * 
 * OFFLINE: Works fully offline using local state
 */

import { Trophy, Target, XCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface QuizResultSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  onRetryWrong?: () => void;
  showRetry?: boolean;
}

export function QuizResultSummary({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  onRetryWrong,
  showRetry = false,
}: QuizResultSummaryProps) {
  // Calculate score percentage
  const scorePercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 0;

  // Determine performance status
  const getPerformanceStatus = () => {
    if (scorePercentage >= 80) {
      return {
        label: 'Excellent!',
        emoji: '🟢',
        color: 'bg-success/10 text-success border-success/20',
        message: 'Outstanding performance! Keep it up!',
      };
    } else if (scorePercentage >= 50) {
      return {
        label: 'Needs Practice',
        emoji: '🟡',
        color: 'bg-warning/10 text-warning border-warning/20',
        message: 'Good effort! Review and try again.',
      };
    } else {
      return {
        label: 'Keep Learning',
        emoji: '🔴',
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        message: 'Don\'t give up! Practice makes perfect.',
      };
    }
  };

  const status = getPerformanceStatus();

  // Don't show if no questions attempted
  if (totalQuestions === 0) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Header with gradient */}
      <div className={`p-4 ${
        scorePercentage >= 80 
          ? 'bg-gradient-to-r from-success/20 to-success/5' 
          : scorePercentage >= 50 
          ? 'bg-gradient-to-r from-warning/20 to-warning/5'
          : 'bg-gradient-to-r from-destructive/20 to-destructive/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-background/80 backdrop-blur">
              <Trophy className={`h-6 w-6 ${
                scorePercentage >= 80 ? 'text-success' : 
                scorePercentage >= 50 ? 'text-warning' : 'text-destructive'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quiz Result Summary</h3>
              <p className="text-sm text-muted-foreground">{status.message}</p>
            </div>
          </div>
          <Badge className={`text-sm px-3 py-1 ${status.color}`}>
            {status.emoji} {status.label}
          </Badge>
        </div>
      </div>

      <CardContent className="pt-6">
        {/* Score display */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold mb-2">
            <span className={
              scorePercentage >= 80 ? 'text-success' : 
              scorePercentage >= 50 ? 'text-warning' : 'text-destructive'
            }>
              {scorePercentage}%
            </span>
          </div>
          <Progress 
            value={scorePercentage} 
            className="h-3 max-w-xs mx-auto"
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Total Questions */}
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>

          {/* Correct */}
          <div className="text-center p-4 rounded-lg bg-success/10">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{correctAnswers}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>

          {/* Wrong */}
          <div className="text-center p-4 rounded-lg bg-destructive/10">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">{wrongAnswers}</div>
            <div className="text-xs text-muted-foreground">Wrong</div>
          </div>
        </div>

        {/* Retry button */}
        {showRetry && wrongAnswers > 0 && onRetryWrong && (
          <Button 
            onClick={onRetryWrong} 
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Wrong Answers ({wrongAnswers})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
