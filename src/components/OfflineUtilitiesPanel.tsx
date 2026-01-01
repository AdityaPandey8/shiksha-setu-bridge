/**
 * OfflineUtilitiesPanel Component
 * 
 * Displays offline-first utilities for enhanced learning:
 * - Daily Motivational Tip
 * - Quick access to bookmarks, doubts, flashcards
 * 
 * All data is stored in localStorage and works without internet.
 */

import { useState } from 'react';
import { Lightbulb, Bookmark, HelpCircle, Layers, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/hooks/useLanguage';
import { useOfflineUtilities } from '@/hooks/useOfflineUtilities';

export function OfflineUtilitiesPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, isHindi } = useLanguage();
  const { bookmarks, doubts, flashcards, getDailyTip } = useOfflineUtilities();

  const dailyTip = getDailyTip(isHindi);
  
  // Count unresolved doubts
  const unresolvedDoubts = doubts.filter(d => !d.resolved).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Daily Motivational Tip */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-primary mb-1">
                💡 {t('dailyTip')}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                "{dailyTip}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Utilities */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Offline Tools</span>
                  <div className="flex gap-2">
                    {bookmarks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {bookmarks.length} {t('bookmarks')}
                      </Badge>
                    )}
                    {unresolvedDoubts > 0 && (
                      <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600">
                        {unresolvedDoubts} doubts
                      </Badge>
                    )}
                    {flashcards.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {flashcards.length} cards
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 grid grid-cols-3 gap-3">
              {/* Bookmarks */}
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <Bookmark className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">{t('bookmarks')}</p>
                <p className="text-lg font-bold text-blue-600">{bookmarks.length}</p>
              </div>
              
              {/* Doubt Notes */}
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <HelpCircle className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-xs font-medium">{t('doubtNotes')}</p>
                <p className="text-lg font-bold text-orange-600">{doubts.length}</p>
              </div>
              
              {/* Flashcards */}
              <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                <Layers className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-medium">{t('flashcards')}</p>
                <p className="text-lg font-bold text-purple-600">{flashcards.length}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
