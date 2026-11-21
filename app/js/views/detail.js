// The selected-trophy detail pane: full original guide, bulleted steps, an interactive -/+/Max
// PSN progress counter, a missable/cutoff callout, multi-source citation cards, and a personal
// notes textarea. Shared by the Checklist, Roadmap and Missables views.

import { isRevealed, maskedLabel } from '../filters.js';
import { progressLabel } from '../data.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function renderDetail(root, trophy, store, { onToggleEarned, onProgressChange, onNoteChange } = {}) {
  if (!trophy) {
    root.innerHTML = '<div class="detail-empty">Select a trophy to read its guide.</div>';
    return;
  }

  const revealed = isRevealed(trophy, store);
  const label = revealed ? { name: trophy.name, description: trophy.description } : maskedLabel();
  const earned = store.isEarned(trophy.id);
  const hasCounter = Boolean(trophy.psnTarget && trophy.psnTarget > 1);
  const progress = store.getProgress(trophy.id);

  root.innerHTML = '';

  const card = document.createElement('article');
  card.className = 'detail-card';

  const head = document.createElement('div');
  head.className = 'detail-head';
  head.innerHTML = `
    <span class="badge grade ${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
    ${trophy.missable ? '<span class="badge missable">Missable</span>' : ''}
    ${trophy.hidden ? '<span class="badge hidden-flag">Hidden</span>' : ''}
  `;
  card.append(head);

  const h2 = document.createElement('h2');
  h2.textContent = label.name;
  card.append(h2);

  const desc = document.createElement('p');
  desc.className = 'd-desc';
  desc.textContent = label.description;
  card.append(desc);

  const meta = document.createElement('div');
  meta.className = 'd-meta';
  meta.innerHTML = `
    <span class="chip">${trophy.category}</span>
    <span class="chip">Roadmap Stage ${trophy.roadmapStage}</span>
  `;
  card.append(meta);

  if (!revealed) {
    const note = document.createElement('p');
    note.className = 'detail-shield-note';
    note.textContent = 'Turn off the Spoiler Shield, or earn this trophy, to read its guide.';
    card.append(note);
    const earnRow = buildEarnToggle(trophy, earned, onToggleEarned);
    card.append(earnRow);
    root.append(card);
    return;
  }

  if (trophy.missable && trophy.cutoffNote) {
    const callout = document.createElement('div');
    callout.className = 'cutoff-callout';
    callout.innerHTML = `<strong>Missable — cutoff warning.</strong> ${trophy.cutoffNote}`;
    card.append(callout);
  }

  const h3Guide = document.createElement('h3');
  h3Guide.textContent = 'Trophy Guide';
  card.append(h3Guide);
  const guide = document.createElement('p');
  guide.className = 'd-guide';
  guide.textContent = trophy.guide;
  card.append(guide);

  if (trophy.steps?.length) {
    const h3Steps = document.createElement('h3');
    h3Steps.textContent = 'Actionable Steps';
    card.append(h3Steps);
    const ul = document.createElement('ul');
    ul.className = 'd-steps';
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ul.append(li);
    }
    card.append(ul);
  }

  if (hasCounter) {
    card.append(buildCounter(trophy, progress, onProgressChange));
  }

  if (trophy.sources?.length) {
    const h3Src = document.createElement('h3');
    h3Src.textContent = `Cited Sources (${trophy.sources.length})`;
    card.append(h3Src);
    const sourceList = document.createElement('div');
    sourceList.className = 'source-list';
    for (const src of trophy.sources) {
      const sourceCard = document.createElement('a');
      sourceCard.className = 'source-card';
      sourceCard.href = src.url;
      sourceCard.target = '_blank';
      sourceCard.rel = 'noopener noreferrer';
      sourceCard.innerHTML = `
        <span class="source-name">${src.name}</span>
        <span class="source-note">${src.note ?? ''}</span>
      `;
      sourceList.append(sourceCard);
    }
    card.append(sourceList);
  }

  card.append(buildEarnToggle(trophy, earned, onToggleEarned));

  const h3Notes = document.createElement('h3');
  h3Notes.textContent = 'Personal Notes';
  card.append(h3Notes);
  const notes = document.createElement('textarea');
  notes.className = 'notes-area';
  notes.placeholder = 'Jot down your own route, timestamp, or reminder for this trophy…';
  notes.value = store.getNote(trophy.id);
  notes.addEventListener('input', () => onNoteChange?.(trophy, notes.value));
  card.append(notes);

  root.append(card);
}

function buildCounter(trophy, progress, onProgressChange) {
  const wrap = document.createElement('div');
  wrap.className = 'counter-block';
  wrap.innerHTML = `<h3>PSN Progress</h3>`;

  const bar = document.createElement('div');
  bar.className = 'progress-bar counter-bar';
  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${Math.min(100, Math.round((progress / trophy.psnTarget) * 100))}%`;
  bar.append(fill);
  wrap.append(bar);

  const row = document.createElement('div');
  row.className = 'counter-row';

  const minus = document.createElement('button');
  minus.className = 'btn btn-counter';
  minus.type = 'button';
  minus.textContent = '−';
  minus.setAttribute('aria-label', 'Decrease progress');

  const value = document.createElement('span');
  value.className = 'counter-value';
  value.textContent = progressLabel(trophy, { getProgress: () => progress });

  const plus = document.createElement('button');
  plus.className = 'btn btn-counter';
  plus.type = 'button';
  plus.textContent = '+';
  plus.setAttribute('aria-label', 'Increase progress');

  const max = document.createElement('button');
  max.className = 'btn btn-counter btn-max';
  max.type = 'button';
  max.textContent = 'Max';

  minus.addEventListener('click', () => onProgressChange?.(trophy, progress - 1));
  plus.addEventListener('click', () => onProgressChange?.(trophy, progress + 1));
  max.addEventListener('click', () => onProgressChange?.(trophy, trophy.psnTarget));

  row.append(minus, value, plus, max);
  wrap.append(row);
  return wrap;
}

function buildEarnToggle(trophy, earned, onToggleEarned) {
  const label = document.createElement('label');
  label.className = 'earn-toggle';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.addEventListener('change', () => onToggleEarned?.(trophy, box.checked));
  label.append(box, document.createTextNode(' Mark earned'));
  return label;
}
