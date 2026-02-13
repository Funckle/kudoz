import * as Sharing from 'expo-sharing';
import { supabase } from './supabase';

// expo-file-system v18+ uses class-based API; we access via legacy compat
const FileSystem = require('expo-file-system') as {
  documentDirectory: string | null;
  writeAsStringAsync: (uri: string, content: string, options?: { encoding: string }) => Promise<void>;
};

function escapeCsv(val: any): string {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Record<string, any>[]): string {
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  return lines.join('\n');
}

export async function exportUserData(userId: string): Promise<{ error?: string }> {
  try {
    const [
      { data: profile },
      { data: goals },
      { data: posts },
      { data: comments },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('comments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    const sections: string[] = [];

    // Profile
    if (profile) {
      sections.push('PROFILE');
      sections.push(toCsv(
        ['name', 'username', 'email', 'bio', 'created_at'],
        [profile],
      ));
    }

    // Goals
    sections.push('\nGOALS');
    sections.push(toCsv(
      ['title', 'description', 'status', 'goal_type', 'effort_target', 'current_value', 'stakes', 'target_date', 'created_at', 'completed_at'],
      goals || [],
    ));

    // Posts
    sections.push('\nPOSTS');
    sections.push(toCsv(
      ['content', 'post_type', 'progress_value', 'media_url', 'created_at', 'edited_at'],
      posts || [],
    ));

    // Comments
    sections.push('\nCOMMENTS');
    sections.push(toCsv(
      ['content', 'post_id', 'parent_comment_id', 'created_at', 'edited_at'],
      comments || [],
    ));

    const csv = sections.join('\n');
    const fileUri = (FileSystem.documentDirectory || '') + 'mokudos-export.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export your Mokudos data',
      });
    }

    return {};
  } catch (e) {
    return { error: 'Failed to export data' };
  }
}
