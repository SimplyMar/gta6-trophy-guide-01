// Fetches app/data/trophies.json once and computes derived totals used across every view: grade
// breakdown, missable count, per-stage roadmap progress, and the Next Up priority queue.

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

/** Progress label for a trophy given its store, e.g. "18 / 42" or null if not a counted trophy. */
export function progressLabel(t, store) {
  if (!t.psnTarget || t.psnTarget <= 1) return null;
  return `${store.getProgress(t.id).toLocaleString()} / ${t.psnTarget.toLocaleString()}`;
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
export function nextUpQueue(trophies, store, limit = 6) {
  const unearned = trophies.filter((t) => !store.isEarned(t.id));
  const score = (t) => {
    let s = 0;
    if (t.missable) s -= 1000;
    s += t.roadmapStage * 100;
    if (t.psnTarget && t.psnTarget > 1) {
      const remaining = 1 - progressFraction(t, store);
      s += remaining * 50;
    } else {
      s += 50;
    }
    return s;
  };
  return unearned
    .slice()
    .sort((a, b) => score(a) - score(b))
    .slice(0, limit);
}

export function estimatedPlatinumTime(doc) {
  // Sums each stage's low/high hour estimate into a single range.
  let lo = 0;
  let hi = 0;
  for (const stage of doc.stages) {
    const [a, b] = stage.estimateHours.split('-').map(Number);
    lo += a;
    hi += b || a;
  }
  return `${lo}-${hi} hours`;
}
