/**
 * useOfflineSync Hook
 * 
 * Manages automatic synchronization when connectivity changes.
 * - Detects online/offline status changes
 * - Automatically syncs pending data when coming back online
 * - Shows sync status to user
 */

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useOfflineStorage } from './useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingCount: number;
  syncSuccess: boolean | null;
}

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const { getPendingSync, clearPendingSync } = useOfflineStorage();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    syncSuccess: null,
  });

  // Count pending sync items
  const updatePendingCount = useCallback(() => {
    const pending = getPendingSync();
    setSyncStatus(prev => ({ ...prev, pendingCount: pending.length }));
  }, [getPendingSync]);

  // Sync all pending data to server
  const syncPendingData = useCallback(async () => {
    const pending = getPendingSync();
    if (pending.length === 0) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncSuccess: null }));

    let successCount = 0;
    let failCount = 0;

    for (const item of pending) {
      try {
        if (item.type === 'progress') {
          const { error } = await supabase
            .from('progress')
            .upsert(item.data as never);
          if (!error) successCount++;
          else failCount++;
        } else if (item.type === 'quiz_score') {
          const { error } = await supabase
            .from('quiz_scores')
            .insert(item.data as never);
          if (!error) successCount++;
          else failCount++;
        }
      } catch (error) {
        console.error('Sync error:', error);
        failCount++;
      }
    }

    // Clear synced items
    if (successCount > 0) {
      clearPendingSync();
    }

    setSyncStatus({
      isSyncing: false,
      lastSyncTime: new Date(),
      pendingCount: failCount,
      syncSuccess: failCount === 0,
    });

    // Show success toast
    if (successCount > 0 && failCount === 0) {
      toast({
        title: "✅ Synced Successfully",
        description: `${successCount} items synced to server`,
      });
    } else if (failCount > 0) {
      toast({
        title: "⚠️ Partial Sync",
        description: `${successCount} synced, ${failCount} failed`,
        variant: "destructive",
      });
    }
  }, [getPendingSync, clearPendingSync, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      // Small delay to ensure stable connection
      const timer = setTimeout(() => {
        syncPendingData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncPendingData]);

  // Update pending count on mount
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    isOnline,
    syncStatus,
    syncPendingData,
    updatePendingCount,
  };
}
