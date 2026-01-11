import Dexie, { type Table } from 'dexie';

// Define interfaces for IndexedDB tables
export interface CachedEbook {
  id: string;
  title: string;
  subject: string;
  class: string;
  language: 'hindi' | 'english';
  description?: string;
  pdfUrl: string;
  pdfBlob?: Blob;
  cachedAt: Date;
  lastAccessed: Date;
  sizeBytes?: number;
}

export interface CachedQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  class: string;
  language: 'hindi' | 'english';
  cachedAt: Date;
}

export interface CachedContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'article' | 'pdf';
  class: string;
  language: 'hindi' | 'english';
  url?: string;
  cachedAt: Date;
}

export interface CachedCareerData {
  id: string;
  type: 'college' | 'scholarship' | 'welfare' | 'career_path';
  title: string;
  description?: string;
  details: Record<string, any>;
  language: 'hindi' | 'english';
  cachedAt: Date;
}

export interface CachedChatbotSummary {
  id: string;
  chapterId: string;
  subject: string;
  class: string;
  summaryText: string;
  keyPoints?: string[];
  language: 'hindi' | 'english';
  cachedAt: Date;
}

export interface OfflineProgress {
  id: string;
  contentId: string;
  completed: boolean;
  completedAt?: Date;
  syncedAt?: Date;
  pendingSync: boolean;
}

export interface OfflineQuizScore {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  attemptedAt: Date;
  syncedAt?: Date;
  pendingSync: boolean;
}

export interface UserPreferences {
  key: string;
  value: any;
  updatedAt: Date;
}

// Create Dexie database
class ShikshaStuDB extends Dexie {
  ebooks!: Table<CachedEbook, string>;
  quizzes!: Table<CachedQuiz, string>;
  content!: Table<CachedContent, string>;
  careerData!: Table<CachedCareerData, string>;
  chatbotSummaries!: Table<CachedChatbotSummary, string>;
  offlineProgress!: Table<OfflineProgress, string>;
  offlineQuizScores!: Table<OfflineQuizScore, string>;
  userPreferences!: Table<UserPreferences, string>;

  constructor() {
    super('ShikshaSetuDB');
    
    this.version(1).stores({
      ebooks: 'id, subject, class, language, cachedAt, lastAccessed',
      quizzes: 'id, class, language, cachedAt',
      content: 'id, contentType, class, language, cachedAt',
      careerData: 'id, type, language, cachedAt',
      chatbotSummaries: 'id, chapterId, subject, class, language, cachedAt',
      offlineProgress: 'id, contentId, pendingSync, syncedAt',
      offlineQuizScores: 'id, quizId, pendingSync, syncedAt, attemptedAt',
      userPreferences: 'key, updatedAt'
    });
  }
}

export const db = new ShikshaStuDB();

// Helper functions for common operations
export async function getCachedEbooks(filters?: { class?: string; subject?: string; language?: string }) {
  let collection = db.ebooks.toCollection();
  
  if (filters?.class) {
    collection = db.ebooks.where('class').equals(filters.class);
  }
  
  const ebooks = await collection.toArray();
  
  if (filters?.subject) {
    return ebooks.filter(e => e.subject === filters.subject);
  }
  if (filters?.language) {
    return ebooks.filter(e => e.language === filters.language);
  }
  
  return ebooks;
}

export async function cacheEbook(ebook: Omit<CachedEbook, 'cachedAt' | 'lastAccessed'>) {
  return db.ebooks.put({
    ...ebook,
    cachedAt: new Date(),
    lastAccessed: new Date()
  });
}

export async function updateEbookLastAccessed(id: string) {
  return db.ebooks.update(id, { lastAccessed: new Date() });
}

export async function deleteEbook(id: string) {
  return db.ebooks.delete(id);
}

export async function getCachedQuizzes(filters?: { class?: string; language?: string }) {
  let quizzes = await db.quizzes.toArray();
  
  if (filters?.class) {
    quizzes = quizzes.filter(q => q.class === filters.class);
  }
  if (filters?.language) {
    quizzes = quizzes.filter(q => q.language === filters.language);
  }
  
  return quizzes;
}

export async function cacheQuizzes(quizzes: Array<Omit<CachedQuiz, 'cachedAt'>>) {
  const now = new Date();
  return db.quizzes.bulkPut(
    quizzes.map(q => ({ ...q, cachedAt: now }))
  );
}

export async function getChatbotSummaries(filters?: { class?: string; subject?: string }) {
  let summaries = await db.chatbotSummaries.toArray();
  
  if (filters?.class) {
    summaries = summaries.filter(s => s.class === filters.class);
  }
  if (filters?.subject) {
    summaries = summaries.filter(s => s.subject === filters.subject);
  }
  
  return summaries;
}

export async function cacheChatbotSummaries(summaries: Array<Omit<CachedChatbotSummary, 'cachedAt'>>) {
  const now = new Date();
  return db.chatbotSummaries.bulkPut(
    summaries.map(s => ({ ...s, cachedAt: now }))
  );
}

export async function getPendingSyncProgress() {
  return db.offlineProgress.where('pendingSync').equals(1).toArray();
}

export async function getPendingSyncQuizScores() {
  return db.offlineQuizScores.where('pendingSync').equals(1).toArray();
}

export async function markProgressSynced(ids: string[]) {
  return db.offlineProgress.where('id').anyOf(ids).modify({ 
    pendingSync: false, 
    syncedAt: new Date() 
  });
}

export async function markQuizScoresSynced(ids: string[]) {
  return db.offlineQuizScores.where('id').anyOf(ids).modify({ 
    pendingSync: false, 
    syncedAt: new Date() 
  });
}

export async function getStorageStats() {
  const [ebooksCount, quizzesCount, contentCount, careerCount, summariesCount] = await Promise.all([
    db.ebooks.count(),
    db.quizzes.count(),
    db.content.count(),
    db.careerData.count(),
    db.chatbotSummaries.count()
  ]);

  const ebooks = await db.ebooks.toArray();
  const totalEbookSize = ebooks.reduce((acc, e) => acc + (e.sizeBytes || 0), 0);

  return {
    ebooks: ebooksCount,
    quizzes: quizzesCount,
    content: contentCount,
    careerData: careerCount,
    chatbotSummaries: summariesCount,
    totalEbookSizeMB: Math.round(totalEbookSize / (1024 * 1024) * 100) / 100
  };
}

export async function clearAllCache() {
  await Promise.all([
    db.ebooks.clear(),
    db.quizzes.clear(),
    db.content.clear(),
    db.careerData.clear(),
    db.chatbotSummaries.clear()
  ]);
}

export async function clearOldCache(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  await Promise.all([
    db.ebooks.where('lastAccessed').below(cutoffDate).delete(),
    db.quizzes.where('cachedAt').below(cutoffDate).delete(),
    db.content.where('cachedAt').below(cutoffDate).delete(),
    db.careerData.where('cachedAt').below(cutoffDate).delete()
  ]);
}
