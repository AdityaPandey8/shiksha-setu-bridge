import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';

interface NetworkStatusBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function NetworkStatusBadge({ className = '', showLabel = true }: NetworkStatusBadgeProps) {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  return (
    <Badge
      variant={isOnline ? 'default' : 'secondary'}
      className={`gap-1.5 ${isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600 text-white'} ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          {showLabel && <span className="text-xs">{t('onlineFull')}</span>}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          {showLabel && <span className="text-xs">{t('offlineLimited')}</span>}
        </>
      )}
    </Badge>
  );
}
