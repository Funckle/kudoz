import { colors } from './theme';
import { getCachedCategories, getCategoryByIdFromCache } from '../services/categories';
import type { Category } from '../types/database';

// Fallback colors by name (used when DB categories are loaded)
const CATEGORY_COLORS: Record<string, string> = {
  Fitness: colors.categories.fitness,
  Health: colors.categories.health,
  Learning: colors.categories.learning,
  Finance: colors.categories.finance,
  Career: colors.categories.career,
  Habits: colors.categories.habits,
  Creative: colors.categories.creative,
  Life: colors.categories.life,
};

export function getCategories(): Category[] {
  return getCachedCategories();
}

export function getCategoryById(id: string): Category | undefined {
  return getCategoryByIdFromCache(id);
}

export function getCategoryColor(id: string): string {
  const cat = getCategoryById(id);
  return cat?.color ?? colors.gray;
}

export function getCategoryColorByName(name: string): string {
  return CATEGORY_COLORS[name] ?? colors.gray;
}
