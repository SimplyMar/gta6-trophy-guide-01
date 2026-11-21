// The 4-stage Platinum Roadmap: stage completion bars, chapter/mission order, collectible
// totals, an estimated platinum time & difficulty card, and the Next Up priority queue.

import { stageProgress, nextUpQueue, estimatedPlatinumTime } from '../data.js';
import { isRevealed, maskedLabel } from '../filters.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export function renderRoadmap(root, doc, store, { selectedId, onSelect, onToggleEarned } = {}) {
  root.innerHTML = '';

  const summary = document.createElement('div');
  summary.className = 'roadmap-summary-card';
  summary.innerHTML = `
    <div>
      <span class="chip">Estimated Platinum Time</span>
      <strong>${estimatedPlatinumTime(doc)}</strong>
    </div>
    <div>
      <span class="chip">Overall Difficulty</span>
      <strong>Moderate</strong>
    </div>
  `;
  root.append(summary);

  const queue = nextUpQueue(doc.trophies, store, 6);
  if (queue.length) {
    const nextUp = document.createElement('div');
    nextUp.className = 'next-up-card';
    nextUp.innerHTML = `<h3>Next Up — Priority Queue</h3>`;
    const ul = document.createElement('ul');
    ul.className = 'next-up-list';
    for (const t of queue) {
      const revealed = isRevealed(t, store);
      const label = revealed ? t.name : maskedLabel().name;
      const li = document.createElement('li');
      li.className = `next-up-item${selectedId === t.id ? ' selected' : ''}`;
      li.innerHTML = `
        <span class="ti-name">${label}</span>
        ${t.missable ? '<span class="badge missable">Missable</span>' : ''}
        <span class="chip">Stage ${t.roadmapStage}</span>
      `;
      li.addEventListener('click', () => onSelect?.(t.id));
      ul.append(li);
    }
    nextUp.append(ul);
    root.append(nextUp);
  }

  const stages = stageProgress(doc, store);
  for (const stage of stages) {
    const block = document.createElement('section');
    block.className = 'stage-block';
    const pct = stage.trophies.length ? Math.round((stage.earned / stage.trophies.length) * 100) : 0;
    block.innerHTML = `
      <div class="stage-head">
        <h2>Stage ${stage.stage} — ${stage.title}</h2>
        <span class="chip">${stage.earned} / ${stage.trophies.length} earned</span>
      </div>
      <p class="stage-sub">${stage.summary}</p>
      <p class="stage-sub">Est. ${stage.estimateHours}h · ${stage.difficulty}</p>
      <div class="progress-bar stage-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    `;

    const grid = document.createElement('div');
    grid.className = 'stage-grid';
    for (const t of stage.trophies) {
      const earned = store.isEarned(t.id);
      const revealed = isRevealed(t, store);
      const label = revealed ? t.name : maskedLabel().name;

      const row = document.createElement('div');
      row.className = `stage-row${earned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned;
      box.addEventListener('click', (e) => e.stopPropagation());
      box.addEventListener('change', () => onToggleEarned?.(t, box.checked));

      const name = document.createElement('span');
      name.className = 'ti-name';
      name.textContent = label;

      const gBadge = document.createElement('span');
      gBadge.className = `badge grade ${t.grade}`;
      gBadge.textContent = GRADE_LABEL[t.grade];

      row.append(box, name, gBadge);
      if (t.missable) {
        const mBadge = document.createElement('span');
        mBadge.className = 'badge missable';
        mBadge.textContent = 'Missable';
        row.append(mBadge);
      }
      row.addEventListener('click', () => onSelect?.(t.id));
      grid.append(row);
    }
    block.append(grid);
    root.append(block);
  }
}
