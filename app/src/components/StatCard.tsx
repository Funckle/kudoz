import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, borders } from '../utils/theme';

interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 70,
    padding: spacing.sm,
    borderWidth: borders.width,
    borderColor: borders.color,
    borderRadius,
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  label: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
});
