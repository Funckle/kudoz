const timestamps: Record<string, number[]> = {};

interface RateLimitConfig {
  maxActions: number;
  windowMs: number;
  cooldownMs: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  post: { maxActions: 5, windowMs: 10 * 60 * 1000, cooldownMs: 5 * 60 * 1000 },
  kudoz: { maxActions: 10, windowMs: 60 * 1000, cooldownMs: 30 * 1000 },
  report: { maxActions: 10, windowMs: 24 * 60 * 60 * 1000, cooldownMs: 60 * 60 * 1000 },
};

export function checkRateLimit(action: string): { allowed: boolean; message?: string } {
  const config = RATE_LIMITS[action];
  if (!config) return { allowed: true };

  const now = Date.now();
  const key = action;

  if (!timestamps[key]) {
    timestamps[key] = [];
  }

  // Remove old entries outside window
  timestamps[key] = timestamps[key].filter((t) => now - t < config.windowMs);

  if (timestamps[key].length >= config.maxActions) {
    const cooldownEnd = timestamps[key][0] + config.windowMs;
    const remainingSeconds = Math.ceil((cooldownEnd - now) / 1000);
    const minutes = Math.ceil(remainingSeconds / 60);
    return {
      allowed: false,
      message: `You're on a roll! Take a ${minutes}-minute breather before your next ${action}.`,
    };
  }

  timestamps[key].push(now);
  return { allowed: true };
}
