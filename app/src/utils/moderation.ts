// Minimal bad word list for MVP. Extend as needed.
const BAD_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'dick', 'pussy', 'cock',
  'cunt', 'bastard', 'slut', 'whore', 'fag', 'faggot', 'nigger',
  'nigga', 'retard', 'retarded', 'kike', 'chink', 'spic', 'wetback',
  'tranny',
];

export function checkContent(text: string): { clean: boolean; flaggedWords: string[] } {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const flaggedWords: string[] = [];

  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (BAD_WORDS.includes(cleaned)) {
      flaggedWords.push(cleaned);
    }
  }

  return { clean: flaggedWords.length === 0, flaggedWords };
}
