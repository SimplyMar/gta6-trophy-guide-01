// Search, category, grade and status filtering, plus spoiler-shield masking rules shared by every
// view that lists trophies.

export const CATEGORIES = ['story', 'missable', 'collectibles', 'activities', 'combat', 'online'];
export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const STATUSES = ['all', 'remaining', 'earned'];

export function applyFilters(trophies, store, filters) {
  const q = (filters.search ?? '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'missable') {
        if (!t.missable && t.category !== 'missable') return false;
      } else if (t.category !== filters.category) {
        return false;
      }
    }
    if (filters.grade && filters.grade !== 'all' && t.grade !== filters.grade) return false;
    const earned = store.isEarned(t.id);
    if (filters.status === 'earned' && !earned) return false;
    if (filters.status === 'remaining' && earned) return false;
    if (q) {
      const stepsText = (t.steps ?? []).join(' ');
      const haystack = `${t.name} ${t.description} ${t.guide} ${t.cutoffAudit ?? ''} ${stepsText}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Whether a trophy's real name/description/guide should be shown right now. */
export function isRevealed(t, store) {
  if (!t.hidden) return true;
  if (store.isEarned(t.id)) return true;
  // Spoiler Shield OFF reveals everything; Shield ON masks unearned hidden trophies.
  return !store.getShield();
}

export function maskedLabel() {
  return {
    name: 'Hidden Trophy',
    description: 'Spoiler Shield is protecting this secret storyline trophy — complete the mission or turn off the Shield to reveal details.',
  };
}
