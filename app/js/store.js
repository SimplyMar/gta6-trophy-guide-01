// localStorage persistence: earned trophy ids, per-trophy PSN progress counters, personal notes,
// and the spoiler-shield toggle. Also builds an ephemeral "seed" store (never touches
// localStorage) so ?seed=demo can render a deterministic mid-playthrough state for screenshots
// without disturbing a real player's saved progress.

const KEY_EARNED = 'leonida-casebook:earned:v1';
const KEY_PROGRESS = 'leonida-casebook:progress:v1';
const KEY_NOTES = 'leonida-casebook:notes:v1';
const KEY_SHIELD = 'leonida-casebook:spoiler-shield:v1';

// The exact seed the spec calls for: 14 earned trophies plus six partial PSN counters.
const SEED_EARNED = [2, 3, 4, 8, 9, 20, 21, 33, 34, 36, 44, 45, 46, 51];
const SEED_PROGRESS = { 17: 18, 31: 38, 15: 94, 30: 2, 35: 47, 25: 5 };

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) — fail silently, state stays in memory only */
  }
}

/**
 * @param {boolean} seeded - when true, returns an in-memory-only store pre-filled with the demo
 *   seed and backed by no persistence, so screenshots/demos never touch real saved progress.
 */
export function createStore(seeded) {
  let earned = seeded ? new Set(SEED_EARNED) : new Set(readJson(KEY_EARNED, []));
  let progress = seeded ? { ...SEED_PROGRESS } : readJson(KEY_PROGRESS, {});
  let notes = seeded ? {} : readJson(KEY_NOTES, {});
  let shield = seeded ? false : readJson(KEY_SHIELD, false);

  const persist = seeded
    ? { earned() {}, progress() {}, notes() {}, shield() {} }
    : {
        earned: () => writeJson(KEY_EARNED, [...earned]),
        progress: () => writeJson(KEY_PROGRESS, progress),
        notes: () => writeJson(KEY_NOTES, notes),
        shield: () => writeJson(KEY_SHIELD, shield),
      };

  return {
    isEarned(id) {
      return earned.has(id);
    },
    setEarned(id, value) {
      if (value) earned.add(id);
      else earned.delete(id);
      persist.earned();
    },
    earnedIds() {
      return new Set(earned);
    },
    earnedCount() {
      return earned.size;
    },
    getProgress(id) {
      return progress[id] ?? 0;
    },
    setProgress(id, value, max) {
      const clamped = Math.max(0, Math.min(max ?? Infinity, Math.trunc(value) || 0));
      progress[id] = clamped;
      persist.progress();
      if (max && clamped >= max) this.setEarned(id, true);
      return clamped;
    },
    getNote(id) {
      return notes[id] ?? '';
    },
    setNote(id, text) {
      if (text) notes[id] = text;
      else delete notes[id];
      persist.notes();
    },
    getShield() {
      return shield;
    },
    setShield(value) {
      shield = Boolean(value);
      persist.shield();
    },
    exportPayload(game) {
      return {
        app: 'leonida-platinum-casebook',
        version: 1,
        exportedAt: new Date().toISOString(),
        game: game ?? 'Grand Theft Auto VI',
        earned: [...earned],
        progress,
        notes,
        spoilerShield: shield,
      };
    },
    importPayload(payload) {
      if (!payload || typeof payload !== 'object') throw new Error('Not a recognized progress file.');
      const list = Array.isArray(payload.earned)
        ? payload.earned
        : Array.isArray(payload)
          ? payload
          : null;
      if (!list) throw new Error('Missing an "earned" array.');
      earned = new Set(list.map(Number).filter((n) => Number.isFinite(n)));
      progress = payload.progress && typeof payload.progress === 'object' ? { ...payload.progress } : {};
      notes = payload.notes && typeof payload.notes === 'object' ? { ...payload.notes } : {};
      shield = Boolean(payload.spoilerShield);
      persist.earned();
      persist.progress();
      persist.notes();
      persist.shield();
    },
  };
}
