import { colors } from './theme';
import { Category } from '../types/database';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Fitness', icon: 'dumbbell', color: colors.categories.fitness },
  { id: '2', name: 'Health', icon: 'heart-pulse', color: colors.categories.health },
  { id: '3', name: 'Learning', icon: 'book-open', color: colors.categories.learning },
  { id: '4', name: 'Finance', icon: 'wallet', color: colors.categories.finance },
  { id: '5', name: 'Career', icon: 'briefcase', color: colors.categories.career },
  { id: '6', name: 'Habits', icon: 'repeat', color: colors.categories.habits },
  { id: '7', name: 'Creative', icon: 'palette', color: colors.categories.creative },
  { id: '8', name: 'Life', icon: 'sun', color: colors.categories.life },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id)?.color ?? colors.gray;
}
