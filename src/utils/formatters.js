// frontend/src/utils/formatters.js
// Shared formatting helpers used across the app

/** Format paise (₹1 = 100 paise) to a readable rupee string */
export function formatRupees(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

/** e.g. 820 XP → "Level 2 — 320/500 XP" */
export function formatXpProgress(xp) {
  const level      = Math.floor(xp / 500) + 1;
  const xpInLevel  = xp % 500;
  return { level, xpInLevel, xpNeeded: 500, pct: Math.round((xpInLevel / 500) * 100) };
}

/** e.g. "2 days ago", "Just now", "Jan 15" */
export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hrs   = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Capitalise first letter */
export function cap(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Session type → human readable label + emoji */
export const SESSION_META = {
  VIDEO:    { label: 'Video Lesson',    emoji: '🎬', color: '#00C8E8' },
  DOCUMENT: { label: 'Reading',         emoji: '📄', color: '#9B59B6' },
  QUIZ:     { label: 'Quiz',            emoji: '🎯', color: '#FF6B35' },
  CODE:     { label: 'Code Challenge',  emoji: '💻', color: '#7ED957' },
  BOSS:     { label: 'Boss Level',      emoji: '👑', color: '#FF4FCB' },
};
