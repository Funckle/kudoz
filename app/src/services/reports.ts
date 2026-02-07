import { supabase } from './supabase';
import type { ContentType, ReportReason } from '../types/database';
import { checkRateLimit } from '../utils/rateLimit';

export async function reportContent(
  reporterId: string,
  contentType: ContentType,
  contentId: string,
  reason: ReportReason
): Promise<{ error?: string }> {
  const rateCheck = checkRateLimit('report');
  if (!rateCheck.allowed) {
    return { error: rateCheck.message };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    content_type: contentType,
    content_id: contentId,
    reason,
  });

  if (error) return { error: error.message };
  return {};
}
