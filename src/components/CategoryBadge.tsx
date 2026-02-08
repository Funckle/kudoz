import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { Category } from '../types/database';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: colors.borderLight }]}>
      <View style={[styles.dot, { backgroundColor: category.color }]} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{category.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    ...typography.caption,
  },
});
