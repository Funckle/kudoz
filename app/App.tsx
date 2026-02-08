import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainerRef } from '@react-navigation/native';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupDeepLinkListener } from './src/services/linking';
import { registerForPushNotifications, setupNotificationListeners } from './src/services/pushNotifications';
import type { NotificationNavData } from './src/services/pushNotifications';
import { fetchCategories } from './src/services/categories';
import { NetworkBanner } from './src/components/NetworkBanner';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';

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
      const cleanup = setupDeepLinkListener();
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

function ThemedApp() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.outer, { backgroundColor: isDark ? '#000000' : '#F5F5F5' }]}>
      <View style={[styles.inner, {
        backgroundColor: colors.background,
        ...(Platform.OS === 'web' ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border } : {}),
      }]}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppInner />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </SafeAreaProvider>
        </QueryClientProvider>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
});
