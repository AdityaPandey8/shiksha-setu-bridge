/**
 * useContentStorage Hook
 * 
 * Manages offline content storage with version tracking,
 * download progress, and automatic sync.
 */

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CachedContent } from '@/lib/db';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';

// Storage limit in bytes (400MB)
const STORAGE_LIMIT_BYTES = 400 * 1024 * 1024;

interface DownloadProgress {
  contentId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'complete' | 'error';
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  content_type: 'video' | 'article' | 'pdf' | 'image';
  class: string;
  language: 'hindi' | 'english';
  article_body?: string | null;
  image_url?: string | null;
  version?: number;
}

export function useContentStorage(filters?: { class?: string; language?: string; contentType?: string }) {
  const isOnline = useOnlineStatus();
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});

  // Get cached content with live updates
  const cachedContent = useLiveQuery(
    async () => {
      let content = await db.content.toArray();
      
      if (filters?.class) {
        content = content.filter(c => c.class === filters.class);
      }
      if (filters?.language) {
        content = content.filter(c => c.language === filters.language);
      }
      if (filters?.contentType) {
        content = content.filter(c => c.contentType === filters.contentType);
      }
      
      return content;
    },
    [filters?.class, filters?.language, filters?.contentType]
  );

  // Check if content is cached
  const isContentCached = useCallback((id: string) => {
    return cachedContent?.some(c => c.id === id) ?? false;
  }, [cachedContent]);

  // Get cached content by ID
  const getCachedContentById = useCallback(async (id: string): Promise<CachedContent | undefined> => {
    const content = await db.content.get(id);
    if (content) {
      // Update last accessed
      await db.content.update(id, { lastAccessed: new Date() });
    }
    return content;
  }, []);

  // Check if update is available
  const hasUpdate = useCallback((id: string, serverVersion: number): boolean => {
    const cached = cachedContent?.find(c => c.id === id);
    if (!cached) return false;
    return serverVersion > cached.version;
  }, [cachedContent]);

  // Compress image to reduce storage
  const compressImage = async (blob: Blob, maxWidth = 1200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(blob);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (compressedBlob) => {
            resolve(compressedBlob || blob);
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  // Download content for offline use
  const downloadContent = useCallback(async (content: ContentItem): Promise<boolean> => {
    // Videos cannot be downloaded
    if (content.content_type === 'video') {
      return false;
    }

    const contentId = content.id;
    
    setDownloadProgress(prev => ({
      ...prev,
      [contentId]: { contentId, progress: 0, status: 'downloading' }
    }));

    try {
      let imageBlob: Blob | undefined;
      let pdfBlob: Blob | undefined;
      let sizeBytes = 0;

      // Download image
      if (content.content_type === 'image' && content.image_url) {
        setDownloadProgress(prev => ({
          ...prev,
          [contentId]: { ...prev[contentId], progress: 20 }
        }));

        const response = await fetch(content.image_url);
        const blob = await response.blob();
        imageBlob = await compressImage(blob);
        sizeBytes += imageBlob.size;

        setDownloadProgress(prev => ({
          ...prev,
          [contentId]: { ...prev[contentId], progress: 80 }
        }));
      }

      // Download PDF
      if (content.content_type === 'pdf' && content.url) {
        setDownloadProgress(prev => ({
          ...prev,
          [contentId]: { ...prev[contentId], progress: 20 }
        }));

        const response = await fetch(content.url);
        pdfBlob = await response.blob();
        sizeBytes += pdfBlob.size;

        setDownloadProgress(prev => ({
          ...prev,
          [contentId]: { ...prev[contentId], progress: 80 }
        }));
      }

      // Check storage limit
      const stats = await getStorageUsage();
      if (stats.totalBytes + sizeBytes > STORAGE_LIMIT_BYTES) {
        setDownloadProgress(prev => ({
          ...prev,
          [contentId]: { ...prev[contentId], status: 'error' }
        }));
        throw new Error('Storage limit exceeded');
      }

      // Save to IndexedDB
      await db.content.put({
        id: content.id,
        title: content.title,
        description: content.description ?? undefined,
        contentType: content.content_type,
        class: content.class,
        language: content.language,
        url: content.url ?? undefined,
        articleBody: content.article_body ?? undefined,
        imageUrl: content.image_url ?? undefined,
        imageBlob,
        pdfBlob,
        version: content.version ?? 1,
        sizeBytes,
        cachedAt: new Date(),
        lastAccessed: new Date()
      });

      setDownloadProgress(prev => ({
        ...prev,
        [contentId]: { contentId, progress: 100, status: 'complete' }
      }));

      // Clear progress after a delay
      setTimeout(() => {
        setDownloadProgress(prev => {
          const { [contentId]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to download content:', error);
      setDownloadProgress(prev => ({
        ...prev,
        [contentId]: { ...prev[contentId], status: 'error' }
      }));
      return false;
    }
  }, []);

  // Delete cached content
  const deleteContent = useCallback(async (id: string) => {
    await db.content.delete(id);
  }, []);

  // Sync content with server
  const syncContent = useCallback(async (userClass?: string, language?: string) => {
    if (!isOnline) return [];

    try {
      let query = supabase.from('content').select('*');
      
      if (userClass) {
        query = query.eq('class', userClass);
      }
      if (language) {
        query = query.eq('language', language as 'hindi' | 'english');
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Check for updates on cached content
      const updates: Array<{ id: string; hasUpdate: boolean }> = [];
      
      for (const item of data || []) {
        const cached = cachedContent?.find(c => c.id === item.id);
        if (cached && item.version > cached.version) {
          updates.push({ id: item.id, hasUpdate: true });
        }
      }

      return data as ContentItem[];
    } catch (error) {
      console.error('Failed to sync content:', error);
      return [];
    }
  }, [isOnline, cachedContent]);

  // Get storage usage
  const getStorageUsage = useCallback(async () => {
    const content = await db.content.toArray();
    const totalBytes = content.reduce((acc, c) => acc + (c.sizeBytes || 0), 0);
    
    return {
      totalBytes,
      totalMB: Math.round(totalBytes / (1024 * 1024) * 100) / 100,
      limitMB: Math.round(STORAGE_LIMIT_BYTES / (1024 * 1024)),
      percentUsed: Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100)
    };
  }, []);

  // Clear old content
  const clearOldContent = useCallback(async (daysOld: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await db.content.where('lastAccessed').below(cutoffDate).delete();
  }, []);

  return {
    cachedContent: cachedContent ?? [],
    downloadProgress,
    isContentCached,
    getCachedContentById,
    hasUpdate,
    downloadContent,
    deleteContent,
    syncContent,
    getStorageUsage,
    clearOldContent
  };
}
