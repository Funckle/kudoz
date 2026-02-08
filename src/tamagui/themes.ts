import { tokens } from './tokens';

const lightTheme = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  color: '#000000',
  colorSecondary: '#6B7280',
  borderColor: '#E5E5E5',
  borderColorLight: '#F5F5F5',
  link: '#007AFF',
  error: '#EF4444',
  warning: '#FEF3C7',
  warningText: '#92400E',
  warningAccent: '#F59E0B',
  // Pseudo-state colors for interactive components
  backgroundHover: '#F5F5F5',
  backgroundPress: '#E5E5E5',
  colorHover: '#000000',
  colorPress: '#000000',
  // Category colors in theme for consistency
  categoryFitness: tokens.color.categoryFitness,
  categoryHealth: tokens.color.categoryHealth,
  categoryLearning: tokens.color.categoryLearning,
  categoryFinance: tokens.color.categoryFinance,
  categoryCareer: tokens.color.categoryCareer,
  categoryHabits: tokens.color.categoryHabits,
  categoryCreative: tokens.color.categoryCreative,
  categoryLife: tokens.color.categoryLife,
} as const;

const darkTheme = {
  background: '#000000',
  surface: '#1A1A1A',
  color: '#FFFFFF',
  colorSecondary: '#9CA3AF',
  borderColor: '#2D2D2D',
  borderColorLight: '#1A1A1A',
  link: '#0A84FF',
  error: '#EF4444',
  warning: '#422006',
  warningText: '#FDE68A',
  warningAccent: '#F59E0B',
  // Pseudo-state colors for interactive components
  backgroundHover: '#1A1A1A',
  backgroundPress: '#2D2D2D',
  colorHover: '#FFFFFF',
  colorPress: '#FFFFFF',
  // Category colors in theme for consistency
  categoryFitness: tokens.color.categoryFitness,
  categoryHealth: tokens.color.categoryHealth,
  categoryLearning: tokens.color.categoryLearning,
  categoryFinance: tokens.color.categoryFinance,
  categoryCareer: tokens.color.categoryCareer,
  categoryHabits: tokens.color.categoryHabits,
  categoryCreative: tokens.color.categoryCreative,
  categoryLife: tokens.color.categoryLife,
} as const;

export type AppTheme = typeof lightTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;
