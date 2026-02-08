import { supabase } from './supabase';
import type { Category } from '../types/database';

let cachedCategories: Category[] | null = null;

export async function fetchCategories(): Promise<Category[]> {
  if (cachedCategories) return cachedCategories;

  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  cachedCategories = (data || []) as Category[];
  return cachedCategories;
}

export function getCachedCategories(): Category[] {
  return cachedCategories || [];
}

export function getCategoryByIdFromCache(id: string): Category | undefined {
  return cachedCategories?.find((c) => c.id === id);
}
