import '@tamagui/native/setup-zeego';
import React, { useEffect, useRef } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainerRef } from '@react-navigation/native';
import { TamaguiProvider, YStack } from 'tamagui';
import config from './tamagui.config';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupDeepLinkListener } from './src/services/linking';
import { registerForPushNotifications, setupNotificationListeners } from './src/services/pushNotifications';
import type { NotificationNavData } from './src/services/pushNotifications';
import { fetchCategories } from './src/services/categories';
import { NetworkBanner } from './src/components/NetworkBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

function AppInner() {
  const auth = useAuthProvider();
  const navigationRef = useRef<NavigationContainerRef<Record<string, unknown>>>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // On native, set up deep link listener for magic link callbacks
    if (Platform.OS !== 'web') {
      const cleanup = setupDeepLinkListener(() => auth.isAuthenticated);
      return cleanup;
    }
  }, []);

  // Register push notifications when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.id) {
      registerForPushNotifications(auth.user.id);
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  // Set up notification tap listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners((data: NotificationNavData) => {
      const nav = navigationRef.current;
      if (!nav) return;

      if (data.post_id) {
        nav.navigate('Main', { screen: 'HomeTab', params: { screen: 'PostDetail', params: { postId: data.post_id } } });
      } else if (data.goal_id) {
        nav.navigate('Main', { screen: 'HomeTab', params: { screen: 'GoalDetail', params: { goalId: data.goal_id } } });
      } else if (data.actor_id) {
        nav.navigate('Main', { screen: 'HomeTab', params: { screen: 'UserProfile', params: { userId: data.actor_id } } });
      }
    });

    return cleanup;
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <NetworkBanner />
      <RootNavigator navigationRef={navigationRef} />
    </AuthContext.Provider>
  );
}

// Set sans-serif font on web where Tamagui's CSS var may not cascade
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
}

export default function App() {
  const colorScheme = useColorScheme();
  const themeName = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <TamaguiProvider config={config} defaultTheme={themeName}>
      <YStack flex={1} alignItems="center" backgroundColor={themeName === 'dark' ? '#000000' : '#F5F5F5'}>
        <YStack
          flex={1}
          width="100%"
          maxWidth={480}
          backgroundColor="$background"
          {...(Platform.OS === 'web' ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '$borderColor' } : {})}
        >
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <AppInner />
              <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
            </SafeAreaProvider>
          </QueryClientProvider>
        </YStack>
      </YStack>
    </TamaguiProvider>
  );
}
