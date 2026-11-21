// Dedicated Missables & PSN Progress Counters dashboard: every missable/caution cutoff up top,
// then an interactive counter card for every PSN-counted trophy.

import { progressLabel, progressFraction } from '../data.js';
import { isRevealed, maskedLabel } from '../filters.js';

export function renderMissables(root, trophies, store, { selectedId, onSelect, onProgressChange } = {}) {
  root.innerHTML = '';

  const missables = trophies.filter((t) => t.missable);
  const counted = trophies.filter((t) => t.psnTarget && t.psnTarget > 1);

  const intro = document.createElement('p');
  intro.className = 'view-intro';
  intro.textContent = `${missables.length} missable/caution trophies and ${counted.length} PSN-counted grind trophies tracked below.`;
  root.append(intro);

  const missSection = document.createElement('section');
  missSection.className = 'missables-section';
  missSection.innerHTML = '<h2>Missable &amp; Caution Cutoffs</h2>';
  const missList = document.createElement('div');
  missList.className = 'missable-grid';
  for (const t of missables) {
    const revealed = isRevealed(t, store);
    const label = revealed ? t.name : maskedLabel().name;
    const earned = store.isEarned(t.id);
    const card = document.createElement('article');
    card.className = `missable-card${earned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
    card.innerHTML = `
      <div class="missable-card-head">
        <span class="ti-name">${label}</span>
        <span class="badge grade ${t.grade}">${t.grade[0].toUpperCase() + t.grade.slice(1)}</span>
      </div>
      <p class="cutoff-text">${revealed && t.cutoffNote ? t.cutoffNote : 'Cutoff details are spoiler-protected until this trophy is revealed.'}</p>
    `;
    card.addEventListener('click', () => onSelect?.(t.id));
    missList.append(card);
  }
  missSection.append(missList);
  root.append(missSection);

  const counterSection = document.createElement('section');
  counterSection.className = 'counters-section';
  counterSection.innerHTML = '<h2>Interactive PSN Progress Counters</h2>';
  const counterGrid = document.createElement('div');
  counterGrid.className = 'counter-grid';
  for (const t of counted) {
    const revealed = isRevealed(t, store);
    const label = revealed ? t.name : maskedLabel().name;
    const progress = store.getProgress(t.id);
    const card = document.createElement('article');
    card.className = `counter-card${selectedId === t.id ? ' selected' : ''}`;

    const head = document.createElement('div');
    head.className = 'missable-card-head';
    head.innerHTML = `<span class="ti-name">${label}</span><span class="badge grade ${t.grade}">${t.grade[0].toUpperCase() + t.grade.slice(1)}</span>`;
    head.addEventListener('click', () => onSelect?.(t.id));

    const bar = document.createElement('div');
    bar.className = 'progress-bar mini-bar';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${Math.round(progressFraction(t, store) * 100)}%`;
    bar.append(fill);

    const row = document.createElement('div');
    row.className = 'counter-row';
    const minus = document.createElement('button');
    minus.className = 'btn btn-counter';
    minus.type = 'button';
    minus.textContent = '−';
    const value = document.createElement('span');
    value.className = 'counter-value';
    value.textContent = progressLabel(t, { getProgress: () => progress });
    const plus = document.createElement('button');
    plus.className = 'btn btn-counter';
    plus.type = 'button';
    plus.textContent = '+';
    const max = document.createElement('button');
    max.className = 'btn btn-counter btn-max';
    max.type = 'button';
    max.textContent = 'Max';

    minus.addEventListener('click', () => onProgressChange?.(t, progress - 1));
    plus.addEventListener('click', () => onProgressChange?.(t, progress + 1));
    max.addEventListener('click', () => onProgressChange?.(t, t.psnTarget));

    row.append(minus, value, plus, max);
    card.append(head, bar, row);
    counterGrid.append(card);
  }
  counterSection.append(counterGrid);
  root.append(counterSection);
}
