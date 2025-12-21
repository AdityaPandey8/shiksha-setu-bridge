import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 text-center animate-slide-up">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        <span>Offline Mode Active - Your progress will sync when internet returns</span>
      </div>
    </div>
  );
}

export function OnlineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
      isOnline 
        ? 'bg-success/10 text-success' 
        : 'bg-warning/10 text-warning'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
