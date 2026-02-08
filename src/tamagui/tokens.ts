import { createTokens } from 'tamagui';

export const tokens = createTokens({
  size: {
    xs: 4,
    sm: 8,
    smPlus: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    true: 16,
  },
  space: {
    xs: 4,
    sm: 8,
    smPlus: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    true: 16,
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
    true: 8,
  },
  zIndex: {
    xs: 0,
    sm: 100,
    smPlus: 200,
    md: 300,
    lg: 400,
    xl: 500,
    xxl: 600,
    true: 300,
  },
  color: {
    // Category colors (same in light/dark)
    categoryFitness: '#F97316',
    categoryHealth: '#14B8A6',
    categoryLearning: '#3B82F6',
    categoryFinance: '#22C55E',
    categoryCareer: '#64748B',
    categoryHabits: '#A855F7',
    categoryCreative: '#EC4899',
    categoryLife: '#F59E0B',
    // Static utility colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
});
