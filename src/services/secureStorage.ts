import { Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Supabase-compatible storage adapter.
 * Native (iOS/Android): uses expo-secure-store (Keychain / Keystore).
 * Web: falls back to localStorage (no SecureStore on web).
 */

let SecureStore: typeof import('expo-secure-store') | null = null;

if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

export const secureStorage: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    if (SecureStore) {
      return SecureStore.getItemAsync(key);
    }
    return localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
    localStorage.removeItem(key);
  },
};
