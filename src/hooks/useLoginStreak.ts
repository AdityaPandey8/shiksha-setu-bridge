import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * LOGIN STREAK STORAGE KEYS
 * All streak data is stored in localStorage for offline-first behavior
 */
const STREAK_STORAGE_KEY = 'login_streak_data';
const STREAK_ALERT_KEY = 'streak_alert';

/**
 * STREAK DATA INTERFACE
 */
interface StreakData {
  lastLoginDate: string; // YYYY-MM-DD format
  streakCount: number;
}

/**
 * STREAK ALERT INTERFACE
 * Used for motivational email simulation when streak breaks
 */
interface StreakAlert {
  email: string;
  studentName: string;
  lastStreak: number;
  sent: boolean;
  timestamp: string;
}

/**
 * GET TODAY'S DATE
 * Returns date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * CALCULATE DATE DIFFERENCE
 * Returns the number of days between two dates
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * IS NEXT DAY
 * Check if date2 is exactly one day after date1
 */
function isNextDay(previousDate: string, currentDate: string): boolean {
  const prev = new Date(previousDate);
  const curr = new Date(currentDate);
  
  // Add one day to previous date
  prev.setDate(prev.getDate() + 1);
  
  return prev.toISOString().split('T')[0] === currentDate;
}

/**
 * GET STORED STREAK DATA
 */
function getStoredStreakData(): StreakData | null {
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * SAVE STREAK DATA
 */
function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving streak data:', error);
  }
}

/**
 * GET STREAK ALERT
 */
function getStreakAlert(): StreakAlert | null {
  try {
    const stored = localStorage.getItem(STREAK_ALERT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * SAVE STREAK ALERT
 */
function saveStreakAlert(alert: StreakAlert): void {
  try {
    localStorage.setItem(STREAK_ALERT_KEY, JSON.stringify(alert));
  } catch (error) {
    console.error('Error saving streak alert:', error);
  }
}

/**
 * CLEAR STREAK ALERT
 */
function clearStreakAlert(): void {
  try {
    localStorage.removeItem(STREAK_ALERT_KEY);
  } catch {
    // Ignore errors
  }
}

/**
 * SIMULATE MOTIVATIONAL EMAIL
 * Console logs the email content (demo implementation)
 */
function simulateMotivationalEmail(alert: StreakAlert): void {
  console.log('='.repeat(60));
  console.log('📧 MOTIVATIONAL EMAIL (DEMO SIMULATION)');
  console.log('='.repeat(60));
  console.log(`To: ${alert.email}`);
  console.log(`Subject: Keep Going! Your Learning Journey Matters 🌱`);
  console.log('-'.repeat(60));
  console.log(`\nHi ${alert.studentName},\n\nWe noticed you missed a day, but that's okay!\nEvery great learner restarts and keeps moving forward.\n\n"Success is the sum of small efforts repeated daily."\n\nYour previous streak was ${alert.lastStreak} days - amazing progress!\n\nLog in to Shiksha Setu and continue your learning journey today!\n\nBest wishes,\nTeam Shiksha Setu 🎓\n  `);
  console.log('='.repeat(60));
}

/**
 * USE LOGIN STREAK HOOK
 * 
 * Tracks consecutive login days with offline-first localStorage storage.
 * Handles streak updates, break detection, and motivational email simulation.
 */
export function useLoginStreak(userEmail?: string, userName?: string) {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [streakBroken, setStreakBroken] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const isOnline = useOnlineStatus();

  /**
   * UPDATE STREAK ON LOGIN
   * Called when user logs in or dashboard loads
   */
  const updateStreak = useCallback(() => {
    const today = getTodayDate();
    const existingData = getStoredStreakData();

    if (!existingData) {
      // First time login - start streak at 1
      const newData: StreakData = {
        lastLoginDate: today,
        streakCount: 1
      };
      saveStreakData(newData);
      setStreakCount(1);
      setStreakBroken(false);
      return;
    }

    const { lastLoginDate, streakCount: currentStreak } = existingData;

    // Same day login - no change
    if (lastLoginDate === today) {
      setStreakCount(currentStreak);
      setStreakBroken(false);
      return;
    }

    // Check if it's the next consecutive day
    if (isNextDay(lastLoginDate, today)) {
      // Streak continues!
      const newStreak = currentStreak + 1;
      const newData: StreakData = {
        lastLoginDate: today,
        streakCount: newStreak
      };
      saveStreakData(newData);
      setStreakCount(newStreak);
      setStreakBroken(false);
      
      // Clear any pending streak alert since user is back
      clearStreakAlert();
      return;
    }

    // Streak broken - more than 1 day gap
    const daysMissed = getDaysDifference(lastLoginDate, today);
    
    if (daysMissed > 1) {
      // Create streak alert for motivational email
      if (userEmail && userName && currentStreak > 0) {
        const alert: StreakAlert = {
          email: userEmail,
          studentName: userName,
          lastStreak: currentStreak,
          sent: false,
          timestamp: new Date().toISOString()
        };
        saveStreakAlert(alert);
      }
      
      // Reset streak to 1
      const newData: StreakData = {
        lastLoginDate: today,
        streakCount: 1
      };
      saveStreakData(newData);
      setStreakCount(1);
      setStreakBroken(true);
      return;
    }
  }, [userEmail, userName]);

  /**
   * CHECK AND SEND MOTIVATIONAL EMAIL
   * Only triggers when online and alert hasn't been sent
   */
  const checkAndSendMotivationalEmail = useCallback(() => {
    if (!isOnline) return;

    const alert = getStreakAlert();
    if (alert && !alert.sent) {
      // Simulate sending motivational email
      simulateMotivationalEmail(alert);
      
      // Mark as sent
      const updatedAlert = { ...alert, sent: true };
      saveStreakAlert(updatedAlert);
      
      // Clear after some time (optional - keep for history)
      setTimeout(() => {
        clearStreakAlert();
      }, 5000);
    }
  }, [isOnline]);

  /**
   * INITIALIZE STREAK ON MOUNT
   */
  useEffect(() => {
    if (!isInitialized && userEmail) {
      updateStreak();
      setIsInitialized(true);
    }
  }, [isInitialized, userEmail, updateStreak]);

  /**
   * CHECK FOR PENDING MOTIVATIONAL EMAILS WHEN ONLINE
   */
  useEffect(() => {
    if (isOnline && isInitialized) {
      checkAndSendMotivationalEmail();
    }
  }, [isOnline, isInitialized, checkAndSendMotivationalEmail]);

  /**
   * GET STREAK DATA FOR DISPLAY
   */
  const getStreakData = useCallback((): StreakData | null => {
    return getStoredStreakData();
  }, []);

  /**
   * RESET STREAK (for testing)
   */
  const resetStreak = useCallback(() => {
    localStorage.removeItem(STREAK_STORAGE_KEY);
    localStorage.removeItem(STREAK_ALERT_KEY);
    setStreakCount(0);
    setStreakBroken(false);
    setIsInitialized(false);
  }, []);

  return {
    streakCount,
    streakBroken,
    isOnline,
    updateStreak,
    getStreakData,
    resetStreak
  };
}
