import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

export function NetworkBanner() {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.error }]}>
      <Text style={styles.text}>No connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  text: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
