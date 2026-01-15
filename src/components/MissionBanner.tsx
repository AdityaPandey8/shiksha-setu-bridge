import { BookOpen, Wifi } from 'lucide-react';

/**
 * MissionBanner - Displays the core mission statement
 * Professional design with subtle animation
 */
export function MissionBanner() {
  return (
    <div className="gradient-primary text-primary-foreground py-2.5 px-4">
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm font-medium">
        <div className="flex items-center gap-1.5 opacity-90">
          <Wifi className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Offline-First</span>
        </div>
        <span className="hidden sm:inline text-primary-foreground/50">•</span>
        <span className="text-center">
          Shiksha Setu ensures uninterrupted learning even without internet
        </span>
        <span className="hidden sm:inline text-primary-foreground/50">•</span>
        <div className="hidden sm:flex items-center gap-1.5 opacity-90">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Classes 6-10</span>
        </div>
      </div>
    </div>
  );
}
