import { StyleSheet } from 'react-native';

export const lightColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#6B7280',
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  error: '#EF4444',
  warning: '#FEF3C7',
  warningText: '#92400E',
  warningAccent: '#F59E0B',
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

export const darkColors = {
  background: '#000000',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#2D2D2D',
  borderLight: '#1A1A1A',
  error: '#EF4444',
  warning: '#422006',
  warningText: '#FDE68A',
  warningAccent: '#F59E0B',
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

export type ThemeColors = typeof lightColors;

// Legacy exports for backward compatibility during migration
export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  grayLight: '#E5E5E5',
  grayLighter: '#F5F5F5',
  red: '#EF4444',
  categories: lightColors.categories,
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
