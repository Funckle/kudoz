import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 70,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius,
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    ...typography.caption,
    marginTop: 2,
  },
});
