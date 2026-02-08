import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_MODERATION_URL = 'https://api.openai.com/v1/moderations';

// Hard-block: any flag triggers rejection
const HARD_BLOCK_CATEGORIES = [
  'hate',
  'hate/threatening',
  'harassment/threatening',
  'self-harm/intent',
  'self-harm/instructions',
  'sexual/minors',
  'illicit/violent',
];

// Soft-block: only triggers rejection above score threshold
const SOFT_BLOCK_THRESHOLDS: Record<string, number> = {
  'harassment': 0.7,
  'self-harm': 0.7,
  'sexual': 0.8,
  'violence': 0.8,
  'violence/graphic': 0.7,
  'illicit': 0.8,
};

serve(async (req) => {
  try {
    const { text, imageUrl } = await req.json() as { text?: string; imageUrl?: string };

    if (!text && !imageUrl) {
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      // Fail open — no API key configured
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build multimodal input array
    const input: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    if (text) {
      input.push({ type: 'text', text });
    }
    if (imageUrl) {
      input.push({ type: 'image_url', image_url: { url: imageUrl } });
    }

    const response = await fetch(OPENAI_MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input,
      }),
    });

    if (!response.ok) {
      // Fail open — API error
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) {
      // Fail open — unexpected response shape
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check hard-block categories (any flag = blocked)
    for (const category of HARD_BLOCK_CATEGORIES) {
      if (result.categories?.[category]) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'This content may contain harmful language. Please revise and try again.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check soft-block categories (score above threshold = blocked)
    const scores = result.category_scores || {};
    for (const [category, threshold] of Object.entries(SOFT_BLOCK_THRESHOLDS)) {
      if (typeof scores[category] === 'number' && scores[category] >= threshold) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'This content may contain harmful language. Please revise and try again.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify({ allowed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_error) {
    // Fail open — any unexpected error
    return new Response(JSON.stringify({ allowed: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
