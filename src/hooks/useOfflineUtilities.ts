/**
 * useOfflineUtilities Hook
 * 
 * Provides offline-first utilities for enhanced learning:
 * - Bookmarks: Save important content for quick access
 * - Doubt Notes: Write and save doubts to ask later
 * - Flashcards: Quick revision cards
 * - Motivational Tips: Daily inspiration
 */

import { useState, useCallback, useEffect } from 'react';

// Storage keys
const STORAGE_KEYS = {
  BOOKMARKS: 'shiksha_setu_bookmarks',
  DOUBTS: 'shiksha_setu_doubts',
  FLASHCARDS: 'shiksha_setu_flashcards',
  TIPS_INDEX: 'shiksha_setu_tips_index',
};

// Interfaces
export interface Bookmark {
  id: string;
  type: 'ebook' | 'content' | 'quiz' | 'career';
  title: string;
  description?: string;
  data?: Record<string, unknown>;
  createdAt: number;
}

export interface DoubtNote {
  id: string;
  question: string;
  context?: string;
  subject?: string;
  resolved: boolean;
  answer?: string;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: number;
  createdAt: number;
}

// Motivational tips (preloaded)
const MOTIVATIONAL_TIPS = [
  { en: "Education is the most powerful weapon to change the world.", hi: "शिक्षा दुनिया को बदलने का सबसे शक्तिशाली हथियार है।" },
  { en: "Success is the sum of small efforts repeated daily.", hi: "सफलता प्रतिदिन किए गए छोटे-छोटे प्रयासों का योग है।" },
  { en: "The beautiful thing about learning is no one can take it away from you.", hi: "सीखने की सुंदर बात यह है कि कोई इसे आपसे छीन नहीं सकता।" },
  { en: "Dream big, start small, act now.", hi: "बड़े सपने देखो, छोटी शुरुआत करो, अभी कदम उठाओ।" },
  { en: "Your limitation is only your imagination.", hi: "आपकी सीमा केवल आपकी कल्पना है।" },
  { en: "Every expert was once a beginner.", hi: "हर विशेषज्ञ कभी शुरुआती था।" },
  { en: "Hard work beats talent when talent doesn't work hard.", hi: "जब प्रतिभा मेहनत नहीं करती, तो मेहनत प्रतिभा को हरा देती है।" },
  { en: "Believe in yourself and all that you are.", hi: "खुद पर और जो आप हैं उस पर विश्वास करो।" },
  { en: "The only way to do great work is to love what you do.", hi: "महान काम करने का एकमात्र तरीका है कि आप जो करते हैं उससे प्यार करें।" },
  { en: "Today's preparation determines tomorrow's achievement.", hi: "आज की तैयारी कल की उपलब्धि निर्धारित करती है।" },
];

export function useOfflineUtilities() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [doubts, setDoubts] = useState<DoubtNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      const storedDoubts = localStorage.getItem(STORAGE_KEYS.DOUBTS);
      const storedFlashcards = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);

      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
      if (storedDoubts) setDoubts(JSON.parse(storedDoubts));
      if (storedFlashcards) setFlashcards(JSON.parse(storedFlashcards));
    } catch (error) {
      console.error('Error loading offline utilities:', error);
    }
  }, []);

  // BOOKMARKS
  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bm_${Date.now()}`,
      createdAt: Date.now(),
    };
    setBookmarks(prev => {
      const updated = [newBookmark, ...prev];
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return updated;
    });
    return newBookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((type: string, title: string) => {
    return bookmarks.some(b => b.type === type && b.title === title);
  }, [bookmarks]);

  // DOUBT NOTES
  const addDoubt = useCallback((doubt: Omit<DoubtNote, 'id' | 'createdAt' | 'resolved'>) => {
    const newDoubt: DoubtNote = {
      ...doubt,
      id: `doubt_${Date.now()}`,
      resolved: false,
      createdAt: Date.now(),
    };
    setDoubts(prev => {
      const updated = [newDoubt, ...prev];
      localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(updated));
      return updated;
    });
    return newDoubt;
  }, []);

  const resolveDoubt = useCallback((id: string, answer?: string) => {
    setDoubts(prev => {
      const updated = prev.map(d =>
        d.id === id ? { ...d, resolved: true, answer } : d
      );
      localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeDoubt = useCallback((id: string) => {
    setDoubts(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // FLASHCARDS
  const addFlashcard = useCallback((flashcard: Omit<Flashcard, 'id' | 'createdAt'>) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `fc_${Date.now()}`,
      createdAt: Date.now(),
    };
    setFlashcards(prev => {
      const updated = [newFlashcard, ...prev];
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(updated));
      return updated;
    });
    return newFlashcard;
  }, []);

  const updateFlashcard = useCallback((id: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => {
      const updated = prev.map(f =>
        f.id === id ? { ...f, ...updates } : f
      );
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFlashcard = useCallback((id: string) => {
    setFlashcards(prev => {
      const updated = prev.filter(f => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // MOTIVATIONAL TIPS
  const getDailyTip = useCallback((isHindi: boolean) => {
    // Get or set daily tip index based on date
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEYS.TIPS_INDEX);
    let tipIndex = 0;

    if (stored) {
      const { date, index } = JSON.parse(stored);
      if (date === today) {
        tipIndex = index;
      } else {
        tipIndex = (index + 1) % MOTIVATIONAL_TIPS.length;
        localStorage.setItem(STORAGE_KEYS.TIPS_INDEX, JSON.stringify({ date: today, index: tipIndex }));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.TIPS_INDEX, JSON.stringify({ date: today, index: 0 }));
    }

    const tip = MOTIVATIONAL_TIPS[tipIndex];
    return isHindi ? tip.hi : tip.en;
  }, []);

  return {
    // Bookmarks
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    // Doubts
    doubts,
    addDoubt,
    resolveDoubt,
    removeDoubt,
    // Flashcards
    flashcards,
    addFlashcard,
    updateFlashcard,
    removeFlashcard,
    // Tips
    getDailyTip,
  };
}
