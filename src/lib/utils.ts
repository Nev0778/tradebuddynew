export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const REWORD_RULES: Array<[RegExp, string]> = [
  [/\byeah\b/gi, 'yes'],
  [/\bnope\b/gi, 'no'],
  [/\bgonna\b/gi, 'going to'],
  [/\bwanna\b/gi, 'would like to'],
  [/\bgotta\b/gi, 'need to'],
  [/\bcheers\b/gi, 'thank you'],
  [/\bcheap\b/gi, 'cost-effective'],
  [/\bstuff\b/gi, 'work'],
  [/\bkinda\b/gi, 'somewhat'],
  [/\bsorta\b/gi, 'somewhat'],
  [/\bu\b/g, 'you'],
  [/\br\b/g, 'are'],
  [/\bur\b/g, 'your'],
  [/\bthx\b/gi, 'thank you'],
  [/\bthanks\b/gi, 'thank you'],
  [/\bmate\b/gi, 'there'],
  [/\bno worries\b/gi, 'not a problem'],
  [/\bno problem\b/gi, 'not a problem'],
];

export function rewordProfessional(text: string): string {
  let result = text.trim();
  for (const [pattern, replacement] of REWORD_RULES) {
    result = result.replace(pattern, replacement);
  }
  // Capitalise first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  // Ensure ends with punctuation
  if (!/[.!?]$/.test(result)) result += '.';
  return result;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
