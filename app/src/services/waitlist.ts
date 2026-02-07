import { supabase } from './supabase';

export async function joinWaitlist(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.from('waitlist').insert({ email });
  if (error) {
    if (error.message.includes('duplicate')) {
      return { error: 'This email is already on the waitlist' };
    }
    return { error: error.message };
  }
  return {};
}
