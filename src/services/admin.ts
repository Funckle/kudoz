import { supabase } from './supabase';
import type {
  ReportWithDetails,
  ModerationActionWithModerator,
  ModerationActionType,
  ContentType,
} from '../types/database';

// ============================================================
// Dashboard
// ============================================================

export async function getDashboardStats(): Promise<{
  pendingReports: number;
  activeSuspensions: number;
  error?: string;
}> {
  const [{ count: pendingReports, error: e1 }, { count: activeSuspensions, error: e2 }] =
    await Promise.all([
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gt('suspended_until', new Date().toISOString()),
    ]);

  if (e1) return { pendingReports: 0, activeSuspensions: 0, error: e1.message };
  if (e2) return { pendingReports: 0, activeSuspensions: 0, error: e2.message };

  return {
    pendingReports: pendingReports ?? 0,
    activeSuspensions: activeSuspensions ?? 0,
  };
}

// ============================================================
// Report Queue
// ============================================================

export async function getPendingReports(
  limit = 20,
  offset = 0,
): Promise<{ reports: ReportWithDetails[]; error?: string }> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey(id, name, username, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return { reports: [], error: error.message };
  return { reports: (data || []) as ReportWithDetails[] };
}

// ============================================================
// Report Detail
// ============================================================

export async function getReportDetail(
  reportId: string,
): Promise<{ report?: ReportWithDetails; error?: string }> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey(id, name, username, avatar_url)
    `)
    .eq('id', reportId)
    .single();

  if (error) return { error: error.message };

  const report = data as ReportWithDetails;

  // Look up content preview and target user
  let contentPreview: string | undefined;
  let targetUserId: string | undefined;

  if (report.content_type === 'post') {
    const { data: post } = await supabase
      .from('posts')
      .select('content, user_id')
      .eq('id', report.content_id)
      .single();
    contentPreview = post?.content || '[No text content]';
    targetUserId = post?.user_id;
  } else if (report.content_type === 'comment') {
    const { data: comment } = await supabase
      .from('comments')
      .select('content, user_id')
      .eq('id', report.content_id)
      .single();
    contentPreview = comment?.content || '[No text content]';
    targetUserId = comment?.user_id;
  } else if (report.content_type === 'user') {
    targetUserId = report.content_id;
    contentPreview = '[User profile]';
  } else if (report.content_type === 'goal') {
    const { data: goal } = await supabase
      .from('goals')
      .select('title, description, user_id')
      .eq('id', report.content_id)
      .single();
    contentPreview = goal ? `${goal.title}: ${goal.description || ''}` : '[Deleted content]';
    targetUserId = goal?.user_id;
  }

  report.content_preview = contentPreview;

  // Get target user info and violation count
  if (targetUserId) {
    const [{ data: targetUser }, { data: violationCount }] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, username, avatar_url')
        .eq('id', targetUserId)
        .single(),
      supabase.rpc('get_violation_count', { p_user_id: targetUserId }),
    ]);
    report.target_user = targetUser ?? undefined;
    report.violation_count = violationCount ?? 0;
  }

  return { report };
}

// ============================================================
// Violation History
// ============================================================

export async function getViolationHistory(
  userId: string,
): Promise<{ actions: ModerationActionWithModerator[]; error?: string }> {
  const { data, error } = await supabase
    .from('moderation_actions')
    .select(`
      *,
      moderator:users!moderation_actions_moderator_id_fkey(id, name, username)
    `)
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return { actions: [], error: error.message };
  return { actions: (data || []) as ModerationActionWithModerator[] };
}

// ============================================================
// Suggested Action (pure function)
// ============================================================

export function getSuggestedAction(
  violationCount: number,
): { action: ModerationActionType; days?: number } {
  if (violationCount <= 1) return { action: 'warn' };
  if (violationCount === 2) return { action: 'suspend', days: 3 };
  if (violationCount === 3) return { action: 'suspend', days: 7 };
  if (violationCount === 4) return { action: 'suspend', days: 30 };
  return { action: 'ban' };
}

// ============================================================
// Actions
// ============================================================

async function logAction(
  moderatorId: string,
  targetUserId: string,
  actionType: ModerationActionType,
  reportId?: string,
  notes?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from('moderation_actions').insert({
    moderator_id: moderatorId,
    report_id: reportId || null,
    target_user_id: targetUserId,
    action_type: actionType,
    notes: notes || null,
  });
  if (error) return { error: error.message };
  return {};
}

async function resolveReport(
  reportId: string,
  status: 'actioned' | 'dismissed',
): Promise<void> {
  await supabase
    .from('reports')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', reportId);
}

export async function dismissReport(
  reportId: string,
  moderatorId: string,
  targetUserId: string,
  notes?: string,
): Promise<{ error?: string }> {
  const result = await logAction(moderatorId, targetUserId, 'dismiss', reportId, notes);
  if (result.error) return result;
  await resolveReport(reportId, 'dismissed');
  return {};
}

export async function removeContent(
  reportId: string,
  contentType: ContentType,
  contentId: string,
  moderatorId: string,
  targetUserId: string,
  notes?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc('admin_remove_content', {
    p_content_type: contentType,
    p_content_id: contentId,
    p_moderator_id: moderatorId,
  });
  if (error) return { error: error.message };

  await logAction(moderatorId, targetUserId, 'remove_content', reportId, notes);
  await resolveReport(reportId, 'actioned');
  return {};
}

export async function warnUser(
  userId: string,
  reportId: string | undefined,
  reason: string,
  moderatorId: string,
): Promise<{ error?: string }> {
  const result = await logAction(moderatorId, userId, 'warn', reportId, reason);
  if (result.error) return result;

  if (reportId) await resolveReport(reportId, 'actioned');

  // Insert notification for the warned user
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'moderation_warning',
    data: { reason },
  });

  return {};
}

export async function suspendUser(
  userId: string,
  days: number,
  reason: string,
  reportId: string | undefined,
  moderatorId: string,
): Promise<{ error?: string }> {
  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + days);

  const { error } = await supabase.rpc('admin_suspend_user', {
    p_target_user_id: userId,
    p_moderator_id: moderatorId,
    p_suspended_until: suspendedUntil.toISOString(),
    p_reason: reason,
  });
  if (error) return { error: error.message };

  await logAction(moderatorId, userId, 'suspend', reportId, `${days}-day suspension: ${reason}`);
  if (reportId) await resolveReport(reportId, 'actioned');

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'moderation_suspension',
    data: { reason, days },
  });

  return {};
}

export async function banUser(
  userId: string,
  reason: string,
  reportId: string | undefined,
  moderatorId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.rpc('admin_suspend_user', {
    p_target_user_id: userId,
    p_moderator_id: moderatorId,
    p_suspended_until: '9999-12-31T23:59:59.999Z',
    p_reason: reason,
  });
  if (error) return { error: error.message };

  await logAction(moderatorId, userId, 'ban', reportId, `Permanent ban: ${reason}`);
  if (reportId) await resolveReport(reportId, 'actioned');

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'moderation_ban',
    data: { reason },
  });

  return {};
}

export async function liftSuspension(
  userId: string,
  moderatorId: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('users')
    .update({ suspended_until: null, suspension_reason: null })
    .eq('id', userId);

  if (error) return { error: error.message };

  await logAction(moderatorId, userId, 'lift_suspension');
  return {};
}
