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

export async function handleDeepLink(url: string, getIsAuthenticated?: () => boolean) {
  // Handle invite deep link when user is already authenticated
  const inviteMatch = url.match(/invite\/([A-Za-z0-9]+)/);
  if (inviteMatch && getIsAuthenticated?.()) {
    Alert.alert('Already signed in', 'You already have access — no invite code needed.');
    return;
  }

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
