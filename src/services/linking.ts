import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const linking = {
  prefixes: [Linking.createURL('/'), 'kudoz://'],
};

/**
 * Get the correct redirect URL for auth callbacks.
 * Web: redirects to the current origin so Supabase JS can pick up the hash.
 * Native: uses the app deep link scheme.
 */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web') {
    // On web, redirect back to the current origin
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://kudoz-app.vercel.app';
  }
  return Linking.createURL('auth/callback');
}

export async function handleDeepLink(url: string) {
  // Handle magic link callback — tokens are in the URL hash fragment (#access_token=...)
  if (url.includes('auth/callback') || url.includes('access_token')) {
    let params: URLSearchParams;

    // Supabase puts tokens in the hash fragment, not query params
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      params = new URLSearchParams(url.substring(hashIndex + 1));
    } else {
      // Fallback: check query params
      params = new URL(url).searchParams;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }
  }
}

export function setupDeepLinkListener() {
  // Handle deep links when app is already open
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Handle deep link that opened the app
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });

  return () => subscription.remove();
}
