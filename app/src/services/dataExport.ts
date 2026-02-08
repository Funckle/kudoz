import * as Sharing from 'expo-sharing';
import { supabase } from './supabase';

// expo-file-system v18+ uses class-based API; we access via legacy compat
const FileSystem = require('expo-file-system') as {
  documentDirectory: string | null;
  writeAsStringAsync: (uri: string, content: string, options?: { encoding: string }) => Promise<void>;
};

export async function exportUserData(userId: string): Promise<{ error?: string }> {
  try {
    // Try edge function for ZIP+CSV export
    const { data, error } = await supabase.functions.invoke('export-data', {
      body: { userId },
    });

    if (error || !data?.data) {
      // Fallback to client-side JSON export
      return exportUserDataFallback(userId);
    }

    const fileUri = (FileSystem.documentDirectory || '') + 'kudoz-data-export.zip';
    await FileSystem.writeAsStringAsync(fileUri, data.data, { encoding: 'base64' });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/zip',
        dialogTitle: 'Export your Kudoz data',
      });
    }

    return {};
  } catch (e) {
    // Fallback to client-side JSON export
    return exportUserDataFallback(userId);
  }
}

async function exportUserDataFallback(userId: string): Promise<{ error?: string }> {
  try {
    const [
      { data: profile },
      { data: goals },
      { data: posts },
      { data: comments },
      { data: follows },
      { data: reactions },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('posts').select('*').eq('user_id', userId),
      supabase.from('comments').select('*').eq('user_id', userId),
      supabase.from('follows').select('*').eq('follower_id', userId),
      supabase.from('reactions').select('*').eq('user_id', userId),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      goals: goals || [],
      posts: posts || [],
      comments: comments || [],
      follows: follows || [],
      reactions: reactions || [],
    };

    const json = JSON.stringify(exportData, null, 2);
    const fileUri = (FileSystem.documentDirectory || '') + 'kudoz-data-export.json';
    await FileSystem.writeAsStringAsync(fileUri, json);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export your Kudoz data',
      });
    }

    return {};
  } catch (e) {
    return { error: 'Failed to export data' };
  }
}
