/**
 * ConnectionStatus Component
 * 
 * Real-time connectivity indicator showing:
 * 🟢 Online - Full Features
 * 🟡 Offline - Limited Features
 * 
 * Also shows sync status and pending item count
 */

import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

export function ConnectionStatus() {
  const { isOnline, syncStatus } = useOfflineSync();
  const { t } = useLanguage();

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 px-2 py-1 transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/10 text-green-600 border-green-500/30'
          : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
      }`}
    >
      {syncStatus.isSyncing ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="text-xs font-medium">{t('syncing')}</span>
        </>
      ) : isOnline ? (
        <>
          {syncStatus.syncSuccess && (
            <Check className="h-3 w-3 text-green-500" />
          )}
          <Wifi className="h-3 w-3" />
          <span className="text-xs font-medium">{t('onlineFull')}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="text-xs font-medium">{t('offlineLimited')}</span>
          {syncStatus.pendingCount > 0 && (
            <span className="text-xs bg-yellow-500/20 px-1 rounded">
              {syncStatus.pendingCount}
            </span>
          )}
        </>
      )}
    </Badge>
  );
}

/**
 * OfflineModeBanner Component
 * 
 * Full-width banner shown when app is offline
 * Provides clear messaging about limited functionality
 */
export function OfflineModeBanner() {
  const { isOnline, syncStatus } = useOfflineSync();
  const { t } = useLanguage();

  if (isOnline && !syncStatus.isSyncing) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center transition-all duration-300 ${
        syncStatus.isSyncing
          ? 'bg-blue-500 text-white'
          : 'bg-yellow-500 text-yellow-900'
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        {syncStatus.isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{t('syncingData')}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>{t('offlineBannerMessage')}</span>
          </>
        )}
      </div>
    </div>
  );
}
