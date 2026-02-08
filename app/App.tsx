import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuthProvider } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupDeepLinkListener } from './src/services/linking';

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

  useEffect(() => {
    // On native, set up deep link listener for magic link callbacks
    if (Platform.OS !== 'web') {
      const cleanup = setupDeepLinkListener();
      return cleanup;
    }
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <RootNavigator />
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <AppInner />
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </QueryClientProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#E5E5E5' } : {}),
  },
});
