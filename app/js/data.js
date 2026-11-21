// Fetches app/data/trophies.json once and computes derived totals used across every view: grade
// breakdown, missable count, per-stage roadmap progress, the Next Up priority queue, and inline SVG trophy emblems.

export async function loadData() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  return doc;
}

export function gradeTotals(trophies) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  return totals;
}

export function missableCount(trophies) {
  return trophies.filter((t) => t.missable).length;
}

export function onlineCount(trophies) {
  return trophies.filter((t) => t.category === 'online').length;
}

/** Progress label for a trophy given its store, e.g. "12 / 18" or "$85,000 / $250,000" */
export function progressLabel(t, store) {
  if (!t.psnTarget || t.psnTarget <= 1) return null;
  const current = store.getProgress(t.id);
  if (t.psnTarget >= 10000) {
    return `$${current.toLocaleString()} / $${t.psnTarget.toLocaleString()}`;
  }
  return `${current.toLocaleString()} / ${t.psnTarget.toLocaleString()}`;
}

export function progressFraction(t, store) {
  if (!t.psnTarget || t.psnTarget <= 1) return store.isEarned(t.id) ? 1 : 0;
  return Math.min(1, store.getProgress(t.id) / t.psnTarget);
}

/** Per-stage completion stats for the roadmap view. */
export function stageProgress(doc, store) {
  const byStage = new Map();
  for (const stage of doc.stages) byStage.set(stage.stage, { ...stage, trophies: [], earned: 0 });
  for (const t of doc.trophies) {
    const bucket = byStage.get(t.roadmapStage);
    if (!bucket) continue;
    bucket.trophies.push(t);
    if (store.isEarned(t.id)) bucket.earned += 1;
  }
  return [...byStage.values()].sort((a, b) => a.stage - b.stage);
}

/**
 * The "Next Up" priority queue: unearned trophies ordered missable-and-close-to-cutoff first,
 * then by roadmap stage, then by how close a counted trophy already is to its target.
 */
export function nextUpQueue(trophies, store, limit = 5) {
  const unearned = trophies.filter((t) => !store.isEarned(t.id));
  const score = (t) => {
    let s = 0;
    if (t.missable) s -= 2000;
    s += (t.roadmapStage ?? 4) * 100;
    if (t.psnTarget && t.psnTarget > 1) {
      const remaining = 1 - progressFraction(t, store);
      s += remaining * 40;
    } else {
      s += 60;
    }
    return s;
  };
  return unearned
    .slice()
    .sort((a, b) => score(a) - score(b))
    .slice(0, limit);
}

export function estimatedPlatinumTime(doc) {
  let lo = 0;
  let hi = 0;
  for (const stage of doc.stages) {
    const [a, b] = (stage.estimateHours ?? '0-0').split('-').map(Number);
    lo += a || 0;
    hi += b || a || 0;
  }
  return lo > 0 ? `~${lo}-${hi} hours` : '~200-250 hours';
}

/** Clean, high-contrast inline SVG trophy emblems */
export function trophySvg(grade, size = 18) {
  const colors = {
    platinum: { main: '#7dd3fc', rim: '#38bdf8', cup: '#0284c7', star: '#f0f9ff' },
    gold: { main: '#f0b94a', rim: '#f59e0b', cup: '#d97706', star: '#fffbeb' },
    silver: { main: '#cbd5e1', rim: '#94a3b8', cup: '#64748b', star: '#ffffff' },
    bronze: { main: '#fb923c', rim: '#ea580c', cup: '#c2410c', star: '#fff7ed' }
  }[grade] || { main: '#cbd5e1', rim: '#94a3b8', cup: '#64748b', star: '#ffffff' };

  return `<svg class="trophy-emblem emblem-${grade}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M5 3.5H19V9.5C19 13.0899 15.866 16 12 16C8.13401 16 5 13.0899 5 9.5V3.5Z" fill="${colors.cup}" stroke="${colors.rim}" stroke-width="1.5"/>
    <path d="M5 5.5H2.5C1.67157 5.5 1 6.17157 1 7V8C1 10.2091 2.79086 12 5 12V5.5Z" fill="${colors.cup}" stroke="${colors.rim}" stroke-width="1.2"/>
    <path d="M19 5.5H21.5C22.3284 5.5 23 6.17157 23 7V8C23 10.2091 21.2091 12 19 12V5.5Z" fill="${colors.cup}" stroke="${colors.rim}" stroke-width="1.2"/>
    <path d="M12 16V19.5M8 21.5H16" stroke="${colors.rim}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="8.5" r="2" fill="${colors.star}" opacity="0.95"/>
  </svg>`;
}
