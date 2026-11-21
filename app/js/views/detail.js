// The selected-trophy detail pane: full original guide, bulleted steps, an interactive -/+/Max
// PSN progress counter, explicit missable/cutoff audit callout, multi-source citation cards, and a personal
// notes textarea.

import { isRevealed, maskedLabel } from '../filters.js';
import { progressLabel, trophySvg } from '../data.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function formatStepCitations(text) {
  // Converts [Source1, Source2] brackets into styled citation badges
  return text.replace(/\[(.*?)\]/g, (_, match) => {
    const parts = match.split(',').map((p) => p.trim());
    return parts.map((p) => `<span class="cite-pill">${p}</span>`).join(' ');
  });
}

export function renderDetail(root, trophy, store, { onToggleEarned, onProgressChange, onNoteChange } = {}) {
  if (!trophy) {
    root.innerHTML = '<div class="detail-empty"><p>Select any trophy to inspect its tactical guide, verified citations, and cutoff audit.</p></div>';
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

  // Header with SVG Emblem & Badges
  const head = document.createElement('div');
  head.className = 'detail-head';
  head.innerHTML = `
    <div class="detail-badge-group">
      <span class="emblem-wrapper">${trophySvg(trophy.grade, 28)}</span>
      <span class="badge grade ${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
      ${trophy.missable ? '<span class="badge missable">Hard Missable</span>' : ''}
      ${!trophy.missable && trophy.category === 'missable' ? '<span class="badge caution">Stranger Strand</span>' : ''}
      ${trophy.hidden ? '<span class="badge hidden-flag">Hidden Story Flag</span>' : ''}
    </div>
  `;
  card.append(head);

  const h2 = document.createElement('h2');
  h2.className = 'detail-title';
  h2.textContent = label.name;
  card.append(h2);

  const desc = document.createElement('blockquote');
  desc.className = 'd-desc';
  desc.textContent = label.description;
  card.append(desc);

  const meta = document.createElement('div');
  meta.className = 'd-meta';
  meta.innerHTML = `
    <span class="chip chip-category">${trophy.category}</span>
    <span class="chip chip-stage">Roadmap Stage ${trophy.roadmapStage}</span>
    ${trophy.psnTarget ? `<span class="chip chip-target">PSN Target: ${trophy.psnTarget >= 10000 ? '$' + trophy.psnTarget.toLocaleString() : trophy.psnTarget.toLocaleString()}</span>` : ''}
  `;
  card.append(meta);

  // If masked by Spoiler Shield
  if (!revealed) {
    const shieldNotice = document.createElement('div');
    shieldNotice.className = 'audit-callout alert-warning';
    shieldNotice.innerHTML = `
      <div class="audit-callout-head">
        <span class="audit-icon">🛡️</span>
        <strong>Spoiler Shield Active</strong>
      </div>
      <p>This secret story trophy has its tactical guide and mission details protected from spoilers. Uncheck <strong>Spoiler Shield</strong> in the top controls or mark this trophy earned to reveal the full dossier.</p>
    `;
    card.append(shieldNotice);

    const earnRow = buildEarnToggle(trophy, earned, onToggleEarned);
    card.append(earnRow);
    root.append(card);
    return;
  }

  // Explicit Missable / Cutoff Audit Callout Box (On EVERY trophy!)
  const auditBox = document.createElement('div');
  let auditClass = 'alert-info';
  let auditTitle = '✅ Cutoff & Point of No Return Audit';
  let auditIcon = '🛡️';

  if (trophy.missable) {
    auditClass = 'alert-danger';
    auditTitle = '⚠️ CRITICAL HARD MISSABLE AUDIT';
    auditIcon = '🚨';
  } else if (trophy.category === 'missable') {
    auditClass = 'alert-warning';
    auditTitle = '⚡ SOURCE DISPUTE & CAUTION AUDIT';
    auditIcon = '⚠️';
  } else if (trophy.category === 'story') {
    auditClass = 'alert-story';
    auditTitle = '📖 UNMISSABLE STORY PROGRESSION AUDIT';
    auditIcon = '🔒';
  }

  auditBox.className = `audit-callout ${auditClass}`;
  auditBox.innerHTML = `
    <div class="audit-callout-head">
      <span class="audit-icon">${auditIcon}</span>
      <strong>${auditTitle}</strong>
    </div>
    <p class="audit-callout-text">${trophy.cutoffAudit || 'Can be earned at any time during story or post-game free roam.'}</p>
  `;
  card.append(auditBox);

  // Tactical Guide Prose
  const h3Guide = document.createElement('h3');
  h3Guide.className = 'section-title';
  h3Guide.textContent = 'Tactical Strategy & Overview';
  card.append(h3Guide);

  const guide = document.createElement('p');
  guide.className = 'd-guide';
  guide.textContent = trophy.guide;
  card.append(guide);

  // Numbered Actionable Steps with Inline Citation Pills
  if (trophy.steps?.length) {
    const h3Steps = document.createElement('h3');
    h3Steps.className = 'section-title';
    h3Steps.textContent = `Actionable Steps (${trophy.steps.length})`;
    card.append(h3Steps);

    const ol = document.createElement('ol');
    ol.className = 'd-steps';
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.innerHTML = formatStepCitations(step);
      ol.append(li);
    }
    card.append(ol);
  }

  // Interactive PSN Progress Counter
  if (hasCounter) {
    card.append(buildCounter(trophy, progress, onProgressChange));
  }

  // Verified Cited Sources Cards
  if (trophy.sources?.length) {
    const h3Src = document.createElement('h3');
    h3Src.className = 'section-title';
    h3Src.textContent = `Verified Cited Sources (${trophy.sources.length})`;
    card.append(h3Src);

    const sourceList = document.createElement('div');
    sourceList.className = 'source-list';
    for (const src of trophy.sources) {
      const sourceCard = document.createElement('a');
      sourceCard.className = 'source-card';
      sourceCard.href = src.url;
      sourceCard.target = '_blank';
      sourceCard.rel = 'noopener noreferrer';

      let domain = '';
      try {
        domain = new URL(src.url).hostname.replace(/^www\./, '');
      } catch {
        domain = 'source';
      }

      sourceCard.innerHTML = `
        <div class="source-card-top">
          <span class="source-name">${src.name}</span>
          <span class="source-domain">${domain} ↗</span>
        </div>
        <p class="source-note">${src.note ?? ''}</p>
      `;
      sourceList.append(sourceCard);
    }
    card.append(sourceList);
  }

  // Earned Checkbox & Action Row
  card.append(buildEarnToggle(trophy, earned, onToggleEarned));

  // Personal Notes Textarea
  const h3Notes = document.createElement('h3');
  h3Notes.className = 'section-title';
  h3Notes.textContent = 'Personal Player Notes';
  card.append(h3Notes);

  const notes = document.createElement('textarea');
  notes.className = 'notes-area';
  notes.placeholder = 'Jot down personal route notes, chapter timestamps, or manual save slot numbers…';
  notes.value = store.getNote(trophy.id);
  notes.addEventListener('input', () => onNoteChange?.(trophy, notes.value));
  card.append(notes);

  root.append(card);
}

function buildCounter(trophy, progress, onProgressChange) {
  const wrap = document.createElement('div');
  wrap.className = 'counter-block';
  wrap.innerHTML = `<h3 class="section-title">Interactive PSN Progress Counter</h3>`;

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

  minus.addEventListener('click', () => onProgressChange?.(trophy, Math.max(0, progress - (trophy.psnTarget >= 10000 ? 5000 : 1))));
  plus.addEventListener('click', () => onProgressChange?.(trophy, Math.min(trophy.psnTarget, progress + (trophy.psnTarget >= 10000 ? 5000 : 1))));
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
  label.append(box, document.createTextNode(earned ? ' Trophy Earned (Marked in Save)' : ' Mark Trophy as Earned'));
  return label;
}
