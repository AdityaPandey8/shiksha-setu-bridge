/**
 * useStudyTools Hook
 * 
 * Provides offline-first study tools stored in IndexedDB:
 * - Highlights (yellow, green, blue)
 * - Underlines
 * - Bookmarks
 * - Doubts
 * - Flashcards
 * 
 * All tools work 100% offline
 */

import { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  TextHighlight, 
  TextUnderline, 
  StudyBookmark, 
  StudyDoubt, 
  StudyFlashcard 
} from '@/lib/db';

export type HighlightColor = 'yellow' | 'green' | 'blue';
export type ContentType = 'content' | 'ebook';

interface UseStudyToolsOptions {
  contentId: string;
  contentType: ContentType;
}

export function useStudyTools({ contentId, contentType }: UseStudyToolsOptions) {
  // Live queries for real-time updates
  const highlights = useLiveQuery(
    () => db.highlights
      .where('contentId')
      .equals(contentId)
      .and(h => h.contentType === contentType)
      .toArray(),
    [contentId, contentType],
    []
  );

  const underlines = useLiveQuery(
    () => db.underlines
      .where('contentId')
      .equals(contentId)
      .and(u => u.contentType === contentType)
      .toArray(),
    [contentId, contentType],
    []
  );

  const bookmarks = useLiveQuery(
    () => db.studyBookmarks
      .where('contentId')
      .equals(contentId)
      .and(b => b.contentType === contentType)
      .toArray(),
    [contentId, contentType],
    []
  );

  const doubts = useLiveQuery(
    () => db.studyDoubts
      .where('contentId')
      .equals(contentId)
      .and(d => d.contentType === contentType)
      .toArray(),
    [contentId, contentType],
    []
  );

  const flashcards = useLiveQuery(
    () => db.studyFlashcards
      .where('contentId')
      .equals(contentId)
      .and(f => f.contentType === contentType)
      .toArray(),
    [contentId, contentType],
    []
  );

  // Highlights
  const addHighlight = useCallback(async (
    selectedText: string,
    color: HighlightColor,
    startOffset: number,
    endOffset: number
  ) => {
    const highlight: TextHighlight = {
      id: `hl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      selectedText,
      color,
      startOffset,
      endOffset,
      createdAt: new Date(),
    };
    await db.highlights.add(highlight);
    return highlight;
  }, [contentId, contentType]);

  const removeHighlight = useCallback(async (id: string) => {
    await db.highlights.delete(id);
  }, []);

  const updateHighlightColor = useCallback(async (id: string, color: HighlightColor) => {
    await db.highlights.update(id, { color });
  }, []);

  // Underlines
  const addUnderline = useCallback(async (
    selectedText: string,
    startOffset: number,
    endOffset: number
  ) => {
    const underline: TextUnderline = {
      id: `ul_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      selectedText,
      startOffset,
      endOffset,
      createdAt: new Date(),
    };
    await db.underlines.add(underline);
    return underline;
  }, [contentId, contentType]);

  const removeUnderline = useCallback(async (id: string) => {
    await db.underlines.delete(id);
  }, []);

  // Bookmarks
  const addBookmark = useCallback(async (
    title: string,
    note?: string,
    pageNumber?: number,
    chapterId?: string
  ) => {
    const bookmark: StudyBookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      title,
      note,
      pageNumber,
      chapterId,
      createdAt: new Date(),
    };
    await db.studyBookmarks.add(bookmark);
    return bookmark;
  }, [contentId, contentType]);

  const removeBookmark = useCallback(async (id: string) => {
    await db.studyBookmarks.delete(id);
  }, []);

  const isBookmarked = useCallback(() => {
    return (bookmarks?.length || 0) > 0;
  }, [bookmarks]);

  // Doubts
  const addDoubt = useCallback(async (
    question: string,
    selectedText?: string,
    note?: string
  ) => {
    const doubt: StudyDoubt = {
      id: `doubt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      question,
      selectedText,
      note,
      resolved: false,
      createdAt: new Date(),
    };
    await db.studyDoubts.add(doubt);
    return doubt;
  }, [contentId, contentType]);

  const resolveDoubt = useCallback(async (id: string, answer?: string) => {
    await db.studyDoubts.update(id, { resolved: true, answer });
  }, []);

  const removeDoubt = useCallback(async (id: string) => {
    await db.studyDoubts.delete(id);
  }, []);

  // Flashcards
  const addFlashcard = useCallback(async (
    front: string,
    back: string,
    selectedText?: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) => {
    const flashcard: StudyFlashcard = {
      id: `fc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      front,
      back,
      selectedText,
      difficulty,
      createdAt: new Date(),
    };
    await db.studyFlashcards.add(flashcard);
    return flashcard;
  }, [contentId, contentType]);

  const updateFlashcard = useCallback(async (id: string, updates: Partial<StudyFlashcard>) => {
    await db.studyFlashcards.update(id, updates);
  }, []);

  const removeFlashcard = useCallback(async (id: string) => {
    await db.studyFlashcards.delete(id);
  }, []);

  const markFlashcardReviewed = useCallback(async (id: string) => {
    await db.studyFlashcards.update(id, { lastReviewed: new Date() });
  }, []);

  return {
    // Data
    highlights: highlights || [],
    underlines: underlines || [],
    bookmarks: bookmarks || [],
    doubts: doubts || [],
    flashcards: flashcards || [],
    
    // Highlights
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    
    // Underlines
    addUnderline,
    removeUnderline,
    
    // Bookmarks
    addBookmark,
    removeBookmark,
    isBookmarked,
    
    // Doubts
    addDoubt,
    resolveDoubt,
    removeDoubt,
    
    // Flashcards
    addFlashcard,
    updateFlashcard,
    removeFlashcard,
    markFlashcardReviewed,
  };
}

// Hook to get all study tools across all content (for Study Tools page)
export function useAllStudyTools() {
  const highlights = useLiveQuery(() => db.highlights.toArray(), [], []);
  const underlines = useLiveQuery(() => db.underlines.toArray(), [], []);
  const bookmarks = useLiveQuery(() => db.studyBookmarks.toArray(), [], []);
  const doubts = useLiveQuery(() => db.studyDoubts.toArray(), [], []);
  const flashcards = useLiveQuery(() => db.studyFlashcards.toArray(), [], []);

  const clearAllHighlights = useCallback(async () => {
    await db.highlights.clear();
  }, []);

  const clearAllUnderlines = useCallback(async () => {
    await db.underlines.clear();
  }, []);

  const clearAllBookmarks = useCallback(async () => {
    await db.studyBookmarks.clear();
  }, []);

  const clearAllDoubts = useCallback(async () => {
    await db.studyDoubts.clear();
  }, []);

  const clearAllFlashcards = useCallback(async () => {
    await db.studyFlashcards.clear();
  }, []);

  return {
    highlights: highlights || [],
    underlines: underlines || [],
    bookmarks: bookmarks || [],
    doubts: doubts || [],
    flashcards: flashcards || [],
    
    clearAllHighlights,
    clearAllUnderlines,
    clearAllBookmarks,
    clearAllDoubts,
    clearAllFlashcards,
  };
}
