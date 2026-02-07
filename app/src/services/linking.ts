import * as Linking from 'expo-linking';
import { supabase } from './supabase';

export const linking = {
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

export async function handleDeepLink(url: string) {
  // Handle magic link callback
  if (url.includes('auth/callback') || url.includes('access_token')) {
    const params = new URL(url).searchParams;
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
