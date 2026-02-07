export const LIMITS = {
  GOAL_TITLE: 50,
  GOAL_DESCRIPTION: 280,
  STAKES: 140,
  POST_CONTENT: 280,
  COMMENT: 280,
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  BIO: 160,
  IMAGE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  IMAGE_MAX_DIMENSION: 1080,
  FREE_GOAL_LIMIT: 3,
  MAX_CATEGORIES_PER_GOAL: 3,
} as const;

const RESERVED_USERNAMES = [
  'admin', 'kudoz', 'support', 'help', 'mod', 'moderator',
  'system', 'official', 'staff', 'team', 'null', 'undefined',
  'api', 'settings', 'profile', 'search', 'notifications',
  'home', 'feed', 'create', 'edit', 'delete', 'login', 'signup',
  'invite', 'waitlist', 'about', 'terms', 'privacy', 'report',
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < LIMITS.USERNAME_MIN) {
    return { valid: false, error: `Username must be at least ${LIMITS.USERNAME_MIN} characters` };
  }
  if (username.length > LIMITS.USERNAME_MAX) {
    return { valid: false, error: `Username must be at most ${LIMITS.USERNAME_MAX} characters` };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and underscores' };
  }
  if (/^_|_$/.test(username)) {
    return { valid: false, error: 'Cannot start or end with underscore' };
  }
  if (/__/.test(username)) {
    return { valid: false, error: 'Cannot have consecutive underscores' };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
