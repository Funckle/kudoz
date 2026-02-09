import { Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Supabase-compatible storage adapter.
 * Native (iOS/Android): uses expo-secure-store (Keychain / Keystore).
 * Web: falls back to localStorage (no SecureStore on web).
 *
 * Values larger than CHUNK_SIZE are split across multiple SecureStore keys
 * to avoid the 2048-byte limit.
 */

let SecureStore: typeof import('expo-secure-store') | null = null;

if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

const CHUNK_SIZE = 2000;

export const secureStorage: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    if (SecureStore) {
      const countRaw = await SecureStore.getItemAsync(`${key}_count`);
      if (countRaw !== null) {
        const count = parseInt(countRaw, 10);
        const chunks: string[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk === null) return null;
          chunks.push(chunk);
        }
        return chunks.join('');
      }
      // Fallback: read unchunked value (backwards compat with existing sessions)
      return SecureStore.getItemAsync(key);
    }
    return localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (SecureStore) {
      // Clean up any previous chunks
      const prevCountRaw = await SecureStore.getItemAsync(`${key}_count`);
      if (prevCountRaw !== null) {
        const prevCount = parseInt(prevCountRaw, 10);
        for (let i = 0; i < prevCount; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }
      // Also remove any unchunked legacy value
      await SecureStore.deleteItemAsync(key);

      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        await SecureStore.deleteItemAsync(`${key}_count`);
      } else {
        const count = Math.ceil(value.length / CHUNK_SIZE);
        for (let i = 0; i < count; i++) {
          await SecureStore.setItemAsync(
            `${key}_chunk_${i}`,
            value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
          );
        }
        await SecureStore.setItemAsync(`${key}_count`, count.toString());
      }
      return;
    }
    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (SecureStore) {
      const countRaw = await SecureStore.getItemAsync(`${key}_count`);
      if (countRaw !== null) {
        const count = parseInt(countRaw, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_count`);
      }
      await SecureStore.deleteItemAsync(key);
      return;
    }
    localStorage.removeItem(key);
  },
};
