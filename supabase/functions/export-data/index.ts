import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { BlobWriter, TextReader, ZipWriter } from 'https://deno.land/x/zipjs@v2.7.17/index.js';

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (val: unknown) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

serve(async (req) => {
  try {
    const { userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [
      { data: profile },
      { data: goals },
      { data: posts },
      { data: comments },
      { data: reactions },
      { data: follows },
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('posts').select('*').eq('user_id', userId),
      supabase.from('comments').select('*').eq('user_id', userId),
      supabase.from('reactions').select('*').eq('user_id', userId),
      supabase.from('follows').select('*').eq('follower_id', userId),
    ]);

    // Build ZIP with CSV files
    const blobWriter = new BlobWriter('application/zip');
    const zipWriter = new ZipWriter(blobWriter);

    // Profile
    if (profile) {
      const profileCsv = toCsv(Object.keys(profile), [profile]);
      await zipWriter.add('profile.csv', new TextReader(profileCsv));
    }

    // Goals
    if (goals && goals.length > 0) {
      const goalsCsv = toCsv(Object.keys(goals[0]), goals);
      await zipWriter.add('goals.csv', new TextReader(goalsCsv));
    }

    // Posts
    if (posts && posts.length > 0) {
      const postsCsv = toCsv(Object.keys(posts[0]), posts);
      await zipWriter.add('posts.csv', new TextReader(postsCsv));
    }

    // Comments
    if (comments && comments.length > 0) {
      const commentsCsv = toCsv(Object.keys(comments[0]), comments);
      await zipWriter.add('comments.csv', new TextReader(commentsCsv));
    }

    // Reactions
    if (reactions && reactions.length > 0) {
      const reactionsCsv = toCsv(Object.keys(reactions[0]), reactions);
      await zipWriter.add('reactions.csv', new TextReader(reactionsCsv));
    }

    // Follows
    if (follows && follows.length > 0) {
      const followsCsv = toCsv(Object.keys(follows[0]), follows);
      await zipWriter.add('follows.csv', new TextReader(followsCsv));
    }

    await zipWriter.close();
    const blob = await blobWriter.getData();

    // Convert to base64
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(JSON.stringify({ data: base64 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
