// The 4-stage Platinum Roadmap: 1-row KPI ribbon, all 4 stages visible above the fold in 1280x800,
// stage progress bars, chapter flow, and selectable trophy grid.

import { stageProgress, trophySvg } from '../data.js';
import { isRevealed, maskedLabel } from '../filters.js';

const GRADE_LABEL = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function renderRoadmap(root, doc, store, { selectedId, onSelect, onToggleEarned } = {}) {
  root.innerHTML = '';

  // Compact 1-row Roadmap KPI ribbon
  const ribbon = document.createElement('div');
  ribbon.className = 'roadmap-kpi-ribbon';
  ribbon.innerHTML = `
    <div class="kpi-ribbon-item">
      <span class="ribbon-label">Est. Time</span>
      <strong class="ribbon-val">~200-250h</strong>
    </div>
    <div class="kpi-ribbon-sep"></div>
    <div class="kpi-ribbon-item">
      <span class="ribbon-label">Difficulty</span>
      <strong class="ribbon-val">4-7/10</strong>
    </div>
    <div class="kpi-ribbon-sep"></div>
    <div class="kpi-ribbon-item">
      <span class="ribbon-label">Playthroughs</span>
      <strong class="ribbon-val">1 Run</strong>
    </div>
    <div class="kpi-ribbon-sep"></div>
    <div class="kpi-ribbon-item highlight">
      <span class="ribbon-label">No Mission Replay</span>
      <strong class="ribbon-val">15 Rolling Saves</strong>
    </div>
    <div class="kpi-ribbon-sep"></div>
    <div class="kpi-ribbon-item alert">
      <span class="ribbon-label">Cheats</span>
      <strong class="ribbon-val">Disables Trophies &amp; Saves</strong>
    </div>
  `;
  root.append(ribbon);

  // 4 Stages Layout: Clean 2x2 or compact stacked grid where ALL 4 stages are visible above the fold
  const stagesWrap = document.createElement('div');
  stagesWrap.className = 'stages-container';

  const stages = stageProgress(doc, store);
  for (const stage of stages) {
    const block = document.createElement('section');
    block.className = 'stage-card';
    const pct = stage.trophies.length ? Math.round((stage.earned / stage.trophies.length) * 100) : 0;

    block.innerHTML = `
      <div class="stage-card-head">
        <div class="stage-title-wrap">
          <span class="stage-number-badge">Stage ${stage.stage}</span>
          <h2 class="stage-title">${stage.title}</h2>
        </div>
        <div class="stage-stat-badge">${stage.earned} / ${stage.trophies.length} earned (${pct}%)</div>
      </div>
      <p class="stage-summary">${stage.summary}</p>
      <div class="stage-meta-row">
        <span class="stage-time">Est. ${stage.estimateHours}h</span>
        <span class="stage-diff">Difficulty: ${stage.difficulty}</span>
      </div>
      <div class="progress-bar stage-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    `;

    const grid = document.createElement('div');
    grid.className = 'stage-trophies-grid';
    for (const t of stage.trophies) {
      const earned = store.isEarned(t.id);
      const revealed = isRevealed(t, store);
      const label = revealed ? t.name : maskedLabel().name;

      const chip = document.createElement('div');
      chip.className = `stage-trophy-chip${earned ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
      chip.dataset.id = String(t.id);

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned;
      box.title = earned ? 'Earned' : 'Mark earned';
      box.addEventListener('click', (e) => e.stopPropagation());
      box.addEventListener('change', () => onToggleEarned?.(t, box.checked));

      const emblemSpan = document.createElement('span');
      emblemSpan.className = 'chip-emblem';
      emblemSpan.innerHTML = trophySvg(t.grade, 14);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'chip-name';
      nameSpan.textContent = label;

      const gBadge = document.createElement('span');
      gBadge.className = `badge grade ${t.grade} mini`;
      gBadge.textContent = GRADE_LABEL[t.grade];

      chip.append(box, emblemSpan, nameSpan, gBadge);

      if (t.missable) {
        const mBadge = document.createElement('span');
        mBadge.className = 'badge missable mini';
        mBadge.textContent = 'Missable';
        chip.append(mBadge);
      }

      chip.addEventListener('click', () => onSelect?.(t.id));
      grid.append(chip);
    }

    block.append(grid);
    stagesWrap.append(block);
  }

  root.append(stagesWrap);
}
