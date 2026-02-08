import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && <Button title="Try again" onPress={onRetry} variant="secondary" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
