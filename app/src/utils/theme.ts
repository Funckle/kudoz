import { StyleSheet } from 'react-native';

export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  grayLight: '#E5E5E5',
  grayLighter: '#F5F5F5',
  red: '#EF4444',
  categories: {
    fitness: '#F97316',
    health: '#14B8A6',
    learning: '#3B82F6',
    finance: '#22C55E',
    career: '#64748B',
    habits: '#A855F7',
    creative: '#EC4899',
    life: '#F59E0B',
  },
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  sectionHeader: { fontSize: 18, fontWeight: '600' as const },
  goalTitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = 8;

export const borders = {
  width: 1,
  color: colors.grayLight,
} as const;

export const globalStyles = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: spacing.md,
  },
});
