import { useCallback, useState, useEffect } from 'react';

/**
 * E-BOOK STORAGE KEYS
 * 
 * E-Books and Content are SEPARATE features:
 * - E-Books = Structured curriculum/textbooks with chapters (offline-first)
 * - Content = Supplementary learning materials (videos, PDFs, notes)
 * 
 * This separation ensures:
 * 1. E-Books work 100% offline after download
 * 2. Content can optionally link to E-Book chapters
 * 3. Clear distinction in UI and data management
 */
const STORAGE_KEYS = {
  EBOOKS: 'shiksha_setu_ebooks',
  DOWNLOADED_EBOOKS: 'shiksha_setu_downloaded_ebooks',
  EBOOK_PROGRESS: 'shiksha_setu_ebook_progress',
};

/**
 * Chapter Interface
 * Each chapter contains educational content that works offline
 */
export interface Chapter {
  id: string;
  title: string;
  content: string; // HTML/Markdown/Plain text
  activities: string[]; // Practice questions
  order: number;
}

/**
 * E-Book Interface
 * Represents a complete curriculum book with chapters
 */
export interface Ebook {
  id: string;
  title: string;
  description: string;
  class: string;
  language: 'hindi' | 'english';
  chapters: Chapter[];
  offlineEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * E-Book Progress Interface
 * Tracks student progress through chapters
 */
export interface EbookProgress {
  ebookId: string;
  chapterId: string;
  completed: boolean;
  completedAt: string | null;
}

/**
 * Initial sample E-Books for demo
 * These are preloaded so the feature works immediately
 */
const INITIAL_EBOOKS: Ebook[] = [
  {
    id: 'ebook_cs_6',
    title: 'Computer Science – Class 6',
    description: 'Introduction to computers and digital literacy',
    class: '6',
    language: 'english',
    offlineEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'ch_cs6_1',
        title: 'Chapter 1: The Digital World',
        content: `
# The Digital World

## What is a Computer?
A computer is an electronic device that processes data according to instructions. It can store, retrieve, and process data.

## Parts of a Computer
1. **Monitor** - The screen that displays information
2. **Keyboard** - Used to type text and commands
3. **Mouse** - A pointing device to interact with the computer
4. **CPU** - The brain of the computer that processes information
5. **Memory** - Where data is stored temporarily or permanently

## Uses of Computers
- Education and learning
- Communication (email, video calls)
- Entertainment (games, movies)
- Business and office work
- Scientific research
        `,
        activities: [
          'Name 5 parts of a computer and their functions.',
          'List 3 ways you use computers in daily life.',
          'Draw and label the main parts of a computer.',
        ],
        order: 1,
      },
      {
        id: 'ch_cs6_2',
        title: 'Chapter 2: Introduction to Internet',
        content: `
# Introduction to Internet

## What is the Internet?
The Internet is a global network of computers connected together. It allows people to share information and communicate worldwide.

## How Does It Work?
- Computers connect through cables, wireless signals, and satellites
- Each computer has a unique address (IP address)
- Data travels in small packets across the network

## Benefits of Internet
1. Access to information from anywhere
2. Instant communication with people globally
3. Online learning opportunities
4. Entertainment and social connection
        `,
        activities: [
          'Explain what the Internet is in your own words.',
          'List 3 benefits of using the Internet for education.',
          'What precautions should you take while using the Internet?',
        ],
        order: 2,
      },
    ],
  },
  {
    id: 'ebook_math_7',
    title: 'गणित – कक्षा 7',
    description: 'संख्याओं और बीजगणित का परिचय',
    class: '7',
    language: 'hindi',
    offlineEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'ch_math7_1',
        title: 'अध्याय 1: पूर्णांक',
        content: `
# पूर्णांक

## पूर्णांक क्या हैं?
पूर्णांक वे संख्याएँ हैं जिनमें धनात्मक संख्याएँ, ऋणात्मक संख्याएँ और शून्य शामिल हैं।

उदाहरण: ..., -3, -2, -1, 0, 1, 2, 3, ...

## पूर्णांकों का जोड़
- समान चिन्ह: संख्याओं को जोड़ें, चिन्ह वही रखें
- अलग चिन्ह: बड़ी संख्या से छोटी घटाएं, बड़ी का चिन्ह रखें

## उदाहरण
1. (+3) + (+5) = +8
2. (-3) + (-5) = -8
3. (+7) + (-3) = +4
4. (-7) + (+3) = -4
        `,
        activities: [
          'निम्नलिखित को हल करें: (+15) + (-8) = ?',
          '(-12) + (-7) = ? का उत्तर दें',
          'पूर्णांकों के 5 उदाहरण दें।',
        ],
        order: 1,
      },
    ],
  },
  {
    id: 'ebook_science_8',
    title: 'Science – Class 8',
    description: 'Exploring the world of science',
    class: '8',
    language: 'english',
    offlineEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'ch_sci8_1',
        title: 'Chapter 1: Cell - The Basic Unit of Life',
        content: `
# Cell - The Basic Unit of Life

## What is a Cell?
A cell is the smallest structural and functional unit of all living organisms. It is often called the "building block of life."

## Types of Cells
1. **Prokaryotic Cells** - No membrane-bound nucleus (bacteria)
2. **Eukaryotic Cells** - Have a membrane-bound nucleus (plants, animals)

## Parts of a Cell
- **Cell Membrane** - Outer covering that protects the cell
- **Nucleus** - Control center containing DNA
- **Cytoplasm** - Jelly-like substance where organelles float
- **Mitochondria** - Powerhouse of the cell
- **Ribosomes** - Protein factories

## Plant vs Animal Cells
| Feature | Plant Cell | Animal Cell |
|---------|------------|-------------|
| Cell Wall | Present | Absent |
| Chloroplast | Present | Absent |
| Shape | Fixed/Rectangular | Irregular |
        `,
        activities: [
          'Draw and label a plant cell and an animal cell.',
          'Why is the cell called the basic unit of life?',
          'Differentiate between prokaryotic and eukaryotic cells.',
        ],
        order: 1,
      },
    ],
  },
];

/**
 * useEbookStorage Hook
 * 
 * Manages offline-first E-Book storage using localStorage.
 * All E-Books are stored locally for 100% offline access.
 */
export function useEbookStorage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<EbookProgress[]>([]);
  const [initialized, setInitialized] = useState(false);

  /**
   * Initialize E-Books on first load
   * Preloads sample E-Books if none exist
   */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.EBOOKS);
    if (stored) {
      setEbooks(JSON.parse(stored));
    } else {
      // Preload initial E-Books for demo
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(INITIAL_EBOOKS));
      setEbooks(INITIAL_EBOOKS);
    }

    // Load downloaded E-Book IDs
    const downloadedStored = localStorage.getItem(STORAGE_KEYS.DOWNLOADED_EBOOKS);
    if (downloadedStored) {
      setDownloadedIds(JSON.parse(downloadedStored));
    }

    // Load progress
    const progressStored = localStorage.getItem(STORAGE_KEYS.EBOOK_PROGRESS);
    if (progressStored) {
      setProgress(JSON.parse(progressStored));
    }

    setInitialized(true);
    console.log('E-Book and Content modules initialized – Offline-First Ready');
  }, []);

  /**
   * Save E-Books to localStorage
   */
  const saveEbooks = useCallback((newEbooks: Ebook[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(newEbooks));
      setEbooks(newEbooks);
    } catch (error) {
      console.error('Error saving E-Books:', error);
    }
  }, []);

  /**
   * Add a new E-Book
   */
  const addEbook = useCallback((ebook: Omit<Ebook, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEbook: Ebook = {
      ...ebook,
      id: `ebook_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...ebooks, newEbook];
    saveEbooks(updated);
    return newEbook;
  }, [ebooks, saveEbooks]);

  /**
   * Update an existing E-Book
   */
  const updateEbook = useCallback((id: string, updates: Partial<Ebook>) => {
    const updated = ebooks.map(eb => 
      eb.id === id 
        ? { ...eb, ...updates, updatedAt: new Date().toISOString() }
        : eb
    );
    saveEbooks(updated);
  }, [ebooks, saveEbooks]);

  /**
   * Delete an E-Book
   */
  const deleteEbook = useCallback((id: string) => {
    const updated = ebooks.filter(eb => eb.id !== id);
    saveEbooks(updated);
    // Also remove from downloaded
    const newDownloaded = downloadedIds.filter(did => did !== id);
    localStorage.setItem(STORAGE_KEYS.DOWNLOADED_EBOOKS, JSON.stringify(newDownloaded));
    setDownloadedIds(newDownloaded);
  }, [ebooks, downloadedIds, saveEbooks]);

  /**
   * Add a chapter to an E-Book
   */
  const addChapter = useCallback((ebookId: string, chapter: Omit<Chapter, 'id' | 'order'>) => {
    const ebook = ebooks.find(eb => eb.id === ebookId);
    if (!ebook) return;

    const newChapter: Chapter = {
      ...chapter,
      id: `ch_${Date.now()}`,
      order: ebook.chapters.length + 1,
    };

    const updated = ebooks.map(eb =>
      eb.id === ebookId
        ? { ...eb, chapters: [...eb.chapters, newChapter], updatedAt: new Date().toISOString() }
        : eb
    );
    saveEbooks(updated);
    return newChapter;
  }, [ebooks, saveEbooks]);

  /**
   * Update a chapter
   */
  const updateChapter = useCallback((ebookId: string, chapterId: string, updates: Partial<Chapter>) => {
    const updated = ebooks.map(eb =>
      eb.id === ebookId
        ? {
            ...eb,
            chapters: eb.chapters.map(ch =>
              ch.id === chapterId ? { ...ch, ...updates } : ch
            ),
            updatedAt: new Date().toISOString(),
          }
        : eb
    );
    saveEbooks(updated);
  }, [ebooks, saveEbooks]);

  /**
   * Delete a chapter
   */
  const deleteChapter = useCallback((ebookId: string, chapterId: string) => {
    const updated = ebooks.map(eb =>
      eb.id === ebookId
        ? {
            ...eb,
            chapters: eb.chapters.filter(ch => ch.id !== chapterId),
            updatedAt: new Date().toISOString(),
          }
        : eb
    );
    saveEbooks(updated);
  }, [ebooks, saveEbooks]);

  /**
   * Mark an E-Book as downloaded for offline use
   */
  const downloadEbook = useCallback((ebookId: string) => {
    if (!downloadedIds.includes(ebookId)) {
      const newDownloaded = [...downloadedIds, ebookId];
      localStorage.setItem(STORAGE_KEYS.DOWNLOADED_EBOOKS, JSON.stringify(newDownloaded));
      setDownloadedIds(newDownloaded);
    }
  }, [downloadedIds]);

  /**
   * Check if an E-Book is downloaded
   */
  const isDownloaded = useCallback((ebookId: string) => {
    return downloadedIds.includes(ebookId);
  }, [downloadedIds]);

  /**
   * Mark chapter as completed
   */
  const markChapterComplete = useCallback((ebookId: string, chapterId: string) => {
    const existingIndex = progress.findIndex(
      p => p.ebookId === ebookId && p.chapterId === chapterId
    );
    
    let newProgress: EbookProgress[];
    if (existingIndex >= 0) {
      newProgress = progress.map((p, i) =>
        i === existingIndex
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : p
      );
    } else {
      newProgress = [
        ...progress,
        {
          ebookId,
          chapterId,
          completed: true,
          completedAt: new Date().toISOString(),
        },
      ];
    }
    
    localStorage.setItem(STORAGE_KEYS.EBOOK_PROGRESS, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, [progress]);

  /**
   * Get progress for an E-Book
   */
  const getEbookProgress = useCallback((ebookId: string) => {
    return progress.filter(p => p.ebookId === ebookId);
  }, [progress]);

  /**
   * Get all E-Books (optionally filtered)
   */
  const getEbooks = useCallback((filters?: { class?: string; language?: string }) => {
    let filtered = [...ebooks];
    if (filters?.class && filters.class !== 'all') {
      filtered = filtered.filter(eb => eb.class === filters.class);
    }
    if (filters?.language && filters.language !== 'all') {
      filtered = filtered.filter(eb => eb.language === filters.language);
    }
    return filtered;
  }, [ebooks]);

  /**
   * Get downloaded E-Books only
   */
  const getDownloadedEbooks = useCallback(() => {
    return ebooks.filter(eb => downloadedIds.includes(eb.id));
  }, [ebooks, downloadedIds]);

  return {
    ebooks,
    initialized,
    addEbook,
    updateEbook,
    deleteEbook,
    addChapter,
    updateChapter,
    deleteChapter,
    downloadEbook,
    isDownloaded,
    markChapterComplete,
    getEbookProgress,
    getEbooks,
    getDownloadedEbooks,
    downloadedIds,
  };
}
