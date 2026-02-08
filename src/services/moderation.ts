import { supabase } from './supabase';

export async function moderateContent(
  text?: string,
  imageUrl?: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { text, imageUrl },
    });

    if (error) {
      // Fail open — Edge Function unreachable
      return { allowed: true };
    }

    return data as { allowed: boolean; reason?: string };
  } catch {
    // Fail open — network error
    return { allowed: true };
  }
}
