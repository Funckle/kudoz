import { createFont } from 'tamagui';

export const systemFont = createFont({
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  size: {
    1: 12,  // caption
    2: 14,  // body
    3: 16,  // goalTitle
    4: 18,  // sectionHeader
    5: 24,  // title
    6: 36,  // bigNumber
    true: 14,
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    5: 32,
    6: 42,
    true: 20,
  },
  weight: {
    4: '400',
    6: '600',
    7: '700',
    true: '400',
  },
  letterSpacing: {
    true: 0,
  },
});
