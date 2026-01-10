import { useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

const OFFLINE_AUTH_KEY = 'offlineAuthData';
const OFFLINE_LOGIN_ENABLED_KEY = 'offlineLoginEnabled';

interface OfflineAuthData {
  userRole: 'student' | 'teacher' | 'admin';
  email: string;
  name: string | null;
  userId: string;
  lastLoginDate: string;
  offlineAuth: boolean;
  class?: string | null;
}

export function useOfflineAuth() {
  const isOnline = useOnlineStatus();

  // Save credentials after successful online login
  const saveOfflineCredentials = useCallback((data: {
    userId: string;
    email: string;
    name: string | null;
    role: 'student' | 'teacher' | 'admin';
    class?: string | null;
  }) => {
    const authData: OfflineAuthData = {
      userRole: data.role,
      email: data.email,
      name: data.name,
      userId: data.userId,
      lastLoginDate: new Date().toISOString().split('T')[0],
      offlineAuth: true,
      class: data.class,
    };
    
    localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(authData));
    localStorage.setItem(OFFLINE_LOGIN_ENABLED_KEY, 'true');
  }, []);

  // Check if offline login is available
  const isOfflineLoginEnabled = useCallback(() => {
    return localStorage.getItem(OFFLINE_LOGIN_ENABLED_KEY) === 'true';
  }, []);

  // Get saved offline auth data
  const getOfflineAuthData = useCallback((): OfflineAuthData | null => {
    const data = localStorage.getItem(OFFLINE_AUTH_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, []);

  // Validate offline login attempt
  const validateOfflineLogin = useCallback((email: string, role: 'student' | 'teacher' | 'admin'): {
    valid: boolean;
    userData: OfflineAuthData | null;
    error?: string;
  } => {
    if (!isOfflineLoginEnabled()) {
      return {
        valid: false,
        userData: null,
        error: 'First login requires internet connection',
      };
    }

    const savedData = getOfflineAuthData();
    if (!savedData) {
      return {
        valid: false,
        userData: null,
        error: 'No saved credentials found. Please login online first.',
      };
    }

    // Check if email and role match
    if (savedData.email.toLowerCase() !== email.toLowerCase()) {
      return {
        valid: false,
        userData: null,
        error: 'Email does not match saved credentials.',
      };
    }

    if (savedData.userRole !== role) {
      return {
        valid: false,
        userData: null,
        error: `Role mismatch. You previously logged in as ${savedData.userRole}.`,
      };
    }

    return {
      valid: true,
      userData: savedData,
    };
  }, [isOfflineLoginEnabled, getOfflineAuthData]);

  // Clear offline auth data (on logout)
  const clearOfflineAuth = useCallback(() => {
    // Don't clear the credentials, just clear the session
    // This allows offline login to still work after logout
  }, []);

  // Update last login date
  const updateLastLoginDate = useCallback(() => {
    const savedData = getOfflineAuthData();
    if (savedData) {
      savedData.lastLoginDate = new Date().toISOString().split('T')[0];
      localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(savedData));
    }
  }, [getOfflineAuthData]);

  return {
    isOnline,
    saveOfflineCredentials,
    isOfflineLoginEnabled,
    getOfflineAuthData,
    validateOfflineLogin,
    clearOfflineAuth,
    updateLastLoginDate,
  };
}
