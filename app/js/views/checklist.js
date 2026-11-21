// The master checklist: official name, description, grade pill, missable/caution badge, inline
// PSN progress bar where the target is greater than 1, and spoiler masking for unearned hidden
// story trophies.

import { isRevealed, maskedLabel } from '../filters.js';
import { progressLabel, progressFraction } from '../data.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function renderChecklist(root, trophies, store, { selectedId, onSelect, onToggleEarned } = {}) {
  root.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'trophy-list';

  if (trophies.length === 0) {
    root.innerHTML = '<p class="empty-state">No trophies match these filters.</p>';
    return;
  }

  for (const t of trophies) {
    const earned = store.isEarned(t.id);
    const revealed = isRevealed(t, store);
    const label = revealed ? { name: t.name, description: t.description } : maskedLabel();

    const li = document.createElement('li');
    li.className = `trophy-item${earned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
    li.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => onToggleEarned?.(t, box.checked));

    const body = document.createElement('div');
    body.className = 'ti-body';

    const title = document.createElement('div');
    title.className = 'ti-title';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'ti-name';
    nameSpan.textContent = label.name;
    title.append(nameSpan);

    const gBadge = document.createElement('span');
    gBadge.className = `badge grade ${t.grade}`;
    gBadge.textContent = GRADE_LABEL[t.grade];
    title.append(gBadge);

    if (t.missable) {
      const mBadge = document.createElement('span');
      mBadge.className = 'badge missable';
      mBadge.textContent = 'Missable';
      title.append(mBadge);
    }
    if (t.hidden) {
      const hBadge = document.createElement('span');
      hBadge.className = 'badge hidden-flag';
      hBadge.textContent = 'Hidden';
      title.append(hBadge);
    }

    const desc = document.createElement('p');
    desc.className = 'ti-desc';
    desc.textContent = label.description;

    body.append(title, desc);

    const plabel = revealed ? progressLabel(t, store) : null;
    if (plabel) {
      const barWrap = document.createElement('div');
      barWrap.className = 'progress-bar mini-bar';
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.style.width = `${Math.round(progressFraction(t, store) * 100)}%`;
      barWrap.append(fill);
      const plabelEl = document.createElement('span');
      plabelEl.className = 'mini-bar-label';
      plabelEl.textContent = plabel;
      const row = document.createElement('div');
      row.className = 'mini-bar-row';
      row.append(barWrap, plabelEl);
      body.append(row);
    }

    li.append(box, body);
    li.addEventListener('click', () => onSelect?.(t.id));
    list.append(li);
  }

  root.append(list);
}
