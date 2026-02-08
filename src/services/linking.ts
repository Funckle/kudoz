import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import type { LinkingOptions } from '@react-navigation/native';
import { supabase } from './supabase';
import type { RootStackParamList } from '../types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'kudoz://'],
  config: {
    screens: {
      Auth: {
        screens: {
          RedeemInvite: 'invite/:code',
        },
      },
    },
  },
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

const ALLOWED_ORIGINS = ['https://kudoz-app.vercel.app', 'kudoz://'];

/**
 * Validates that a string looks like a JWT (3 dot-separated base64 segments).
 */
function isJwtFormat(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  // Each segment should be non-empty base64url characters
  return parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part));
}

/**
 * Validates that the URL origin matches an expected callback source.
 */
function isAllowedOrigin(url: string): boolean {
  return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
}

export async function handleDeepLink(url: string, getIsAuthenticated?: () => boolean) {
  // Handle invite deep link when user is already authenticated
  const inviteMatch = url.match(/invite\/([A-Za-z0-9]+)/);
  if (inviteMatch && getIsAuthenticated?.()) {
    Alert.alert('Already signed in', 'You already have access — no invite code needed.');
    return;
  }

  // Only process auth callbacks from expected origins
  if (!url.includes('auth/callback') && !url.includes('access_token')) {
    return;
  }

  if (!isAllowedOrigin(url)) {
    Alert.alert('Authentication Error', 'The sign-in link came from an unexpected source.');
    return;
  }

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

  if (!accessToken || !refreshToken) {
    Alert.alert('Authentication Error', 'The sign-in link is missing required tokens.');
    return;
  }

  if (!isJwtFormat(accessToken)) {
    Alert.alert('Authentication Error', 'The sign-in link contains an invalid token.');
    return;
  }

  try {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  } catch {
    Alert.alert('Authentication Error', 'Failed to complete sign-in. Please try again.');
  }
}

export function setupDeepLinkListener(getIsAuthenticated?: () => boolean) {
  // Handle deep links when app is already open
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url, getIsAuthenticated);
  });

  // Handle deep link that opened the app
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url, getIsAuthenticated);
  });

  return () => subscription.remove();
}
