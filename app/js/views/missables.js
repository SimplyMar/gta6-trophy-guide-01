// Dedicated Missables, Points of No Return, Source Consensus Audit, and Interactive PSN Counters Dashboard.

import { progressLabel, progressFraction, trophySvg } from '../data.js';
import { isRevealed, maskedLabel } from '../filters.js';

export function renderMissables(root, trophies, store, { selectedId, onSelect, onProgressChange } = {}) {
  root.innerHTML = '';

  const counted = trophies.filter((t) => t.psnTarget && t.psnTarget > 1);

  // Intro banner
  const intro = document.createElement('div');
  intro.className = 'missables-header-card';
  intro.innerHTML = `
    <h2>Cutoffs, Save Rules &amp; PSN Progress Dashboard</h2>
    <p>Comprehensive audit of GTA VI points-of-no-return, stranger strand continuity, manual save preservation, and live PSN progress tracking.</p>
  `;
  root.append(intro);

  // TIER A: Hard Missable & No-Replay Warnings
  const tierA = document.createElement('section');
  tierA.className = 'missable-tier tier-a';
  tierA.innerHTML = `
    <h3 class="tier-title"><span class="tier-icon">🚨</span> Tier A: Hard Missable &amp; Permanent Cutoff Warnings</h3>
    <div class="warnings-grid">
      <div class="warning-card danger" id="cardMissable28">
        <div class="warning-card-head">
          <span class="warning-badge danger">CRITICAL HARD MISSABLE</span>
          <h4>Positive Mental Attitude (Chapter 1 Balcony Cutoff)</h4>
        </div>
        <p class="warning-body">The very first meditation spot is located on the second-floor balcony of Jason's safehouse with Lucia immediately following the Chapter 1 mission <em>Down to Earth</em>. If you advance to Chapter 2 without meditating here, this location becomes permanently inaccessible, completely locking you out of the trophy and 100% completion for this entire playthrough [PowerPyx, Game-Checklists, GamesRadar].</p>
        <button class="btn btn-sm btn-outline" type="button" data-select="28">Inspect Trophy 28 Guide →</button>
      </div>

      <div class="warning-card alert">
        <div class="warning-card-head">
          <span class="warning-badge alert">NO MISSION REPLAY</span>
          <h4>Rolling 15-Save Preservation Protocol</h4>
        </div>
        <p class="warning-body">Grand Theft Auto VI does <strong>not</strong> include a mission replay or chapter select feature in the pause menu. Story decisions, world changes, and safehouse access persist permanently. Maintain at least <strong>15 rolling manual saves</strong> staggered across chapter boundaries and before committing to heist branching [PowerPyx, Game-Checklists].</p>
      </div>

      <div class="warning-card warning">
        <div class="warning-card-head">
          <span class="warning-badge warning">CHEATS LOCKOUT</span>
          <h4>Cheats Invalidate Saves &amp; Trophies</h4>
        </div>
        <p class="warning-body">Entering any telephone or button cheat codes permanently disables PlayStation 5 trophy progression and prohibits saving on that game profile. Never activate cheats on your primary platinum save file [PowerPyx, Promptowy].</p>
      </div>
    </div>
  `;
  root.append(tierA);

  // TIER B: Source Consensus & Dispute Audit (Stranger Strands)
  const tierB = document.createElement('section');
  tierB.className = 'missable-tier tier-b';
  tierB.innerHTML = `
    <h3 class="tier-title"><span class="tier-icon">⚖️</span> Tier B: Source Consensus &amp; Dispute Audit (Stranger Strands)</h3>
    <div class="audit-consensus-card">
      <div class="consensus-head">
        <span class="consensus-status-badge">CONSENSUS VERIFIED: AVAILABLE POST-STORY</span>
        <span class="consensus-sources-badge">PowerPyx · GTABase · Space4Games · Game-Checklists</span>
      </div>
      <div class="consensus-content">
        <p><strong>The Community Dispute:</strong> Early tracker rumors speculated that several stranger mission chains (Andy's community service, Kenton's shipwreck diving, Billy's motorcycle stunts, Randy's vehicle favors, and Tyrone's radio piracy) might expire upon entering Chapter 5.</p>
        <p><strong>The Verified Reality:</strong> Full post-game verifications by <em>PowerPyx</em> and <em>GTABase</em> definitively confirm that all 8 Stranger Strands remain open and completable in post-story free-roam. Kenton's shipwreck chain in Key Lento (which utilizes the handheld metal detector) and Randy's vehicle deliveries can be cleared after the credits roll.</p>
        <p class="consensus-recommendation"><strong>Tactical Recommendation:</strong> While verified available post-game, conservative speedrun trackers (<em>Space4Games</em>, <em>Game-Checklists</em>) strongly recommend completing strangers as they appear or creating hard saves before Chapter 5 to guard against rare world-state anomalies.</p>
      </div>
    </div>
  `;
  root.append(tierB);

  // TIER C: Interactive PSN Progress Counters Grid
  const tierC = document.createElement('section');
  tierC.className = 'missable-tier tier-c';
  tierC.innerHTML = `
    <h3 class="tier-title"><span class="tier-icon">📊</span> Tier C: Interactive PSN Progress Counters (${counted.length} Tracked Trophies)</h3>
  `;

  const counterGrid = document.createElement('div');
  counterGrid.className = 'counter-grid';

  for (const t of counted) {
    const revealed = isRevealed(t, store);
    const label = revealed ? t.name : maskedLabel().name;
    const progress = store.getProgress(t.id);
    const pct = Math.round(progressFraction(t, store) * 100);

    const card = document.createElement('article');
    card.className = `counter-card${selectedId === t.id ? ' selected' : ''}`;
    card.dataset.id = String(t.id);

    const head = document.createElement('div');
    head.className = 'counter-card-head';
    head.innerHTML = `
      <div class="counter-head-left">
        ${trophySvg(t.grade, 18)}
        <span class="counter-card-title">${label}</span>
      </div>
      <span class="badge grade ${t.grade} mini">${t.grade}</span>
    `;
    head.addEventListener('click', () => onSelect?.(t.id));

    const bar = document.createElement('div');
    bar.className = 'progress-bar mini-bar';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${pct}%`;
    bar.append(fill);

    const row = document.createElement('div');
    row.className = 'counter-row';

    const stepSize = t.psnTarget >= 10000 ? 5000 : 1;

    const minus = document.createElement('button');
    minus.className = 'btn btn-counter';
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', `Decrease ${t.name}`);

    const value = document.createElement('span');
    value.className = 'counter-value';
    value.textContent = progressLabel(t, { getProgress: () => progress });

    const plus = document.createElement('button');
    plus.className = 'btn btn-counter';
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', `Increase ${t.name}`);

    const max = document.createElement('button');
    max.className = 'btn btn-counter btn-max';
    max.type = 'button';
    max.textContent = 'Max';

    minus.addEventListener('click', (e) => {
      e.stopPropagation();
      onProgressChange?.(t, Math.max(0, progress - stepSize));
    });
    plus.addEventListener('click', (e) => {
      e.stopPropagation();
      onProgressChange?.(t, Math.min(t.psnTarget, progress + stepSize));
    });
    max.addEventListener('click', (e) => {
      e.stopPropagation();
      onProgressChange?.(t, t.psnTarget);
    });

    row.append(minus, value, plus, max);
    card.append(head, bar, row);
    card.addEventListener('click', () => onSelect?.(t.id));
    counterGrid.append(card);
  }

  tierC.append(counterGrid);
  root.append(tierC);

  // Wire quick-jump buttons
  const btn28 = root.querySelector('[data-select="28"]');
  if (btn28) {
    btn28.addEventListener('click', () => onSelect?.(28));
  }
}
