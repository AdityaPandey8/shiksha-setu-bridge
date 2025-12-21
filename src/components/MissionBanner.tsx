import { Heart, BookOpen } from 'lucide-react';

export function MissionBanner() {
  return (
    <div className="gradient-primary text-primary-foreground py-3 px-4">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-medium">
        <BookOpen className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
        <span className="text-center">
          Shiksha Setu ensures uninterrupted learning even without internet
        </span>
        <Heart className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
      </div>
    </div>
  );
}
