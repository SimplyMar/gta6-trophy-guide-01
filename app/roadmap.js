// Builds the Platinum Roadmap view: the 55 trophies grouped into the 3 roadmap stages the
// story/chapter flow naturally falls into (early game, mid-game & strand strangers, endgame grind).
// Exported so app.js can render it inside the roadmap tab and share the same selection/earned state.

const STAGE_META = {
  1: {
    title: 'Stage 1 — Early Leonida',
    sub: 'Opening missions, first chapters and easy early activities. Clear these while the map is still small.',
  },
  2: {
    title: 'Stage 2 — Mid-Game & Stranger Strands',
    sub: 'Chapters 4–late story, vehicle/activity grinding and every missable stranger strand. Do not let these strands lapse.',
  },
  3: {
    title: 'Stage 3 — Endgame & 100% Grind',
    sub: 'Final story missions, the big collectible/skill grinds and 100% completion. Save this for the platinum-run cleanup.',
  },
};

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function rowLabel(t, spoilerOn, earned) {
  const reveal = spoilerOn || earned;
  if (t.hidden && !reveal) return { name: 'Hidden Trophy', desc: 'Spoiler-protected — enable Spoiler mode or earn it to reveal.' };
  return { name: t.name, desc: t.description };
}

/**
 * Renders the roadmap into `container`.
 * @param {HTMLElement} container
 * @param {Array} trophies
 * @param {{earned: Set<string>, spoiler: boolean, selectedId: number|null, onSelect: (id:number)=>void}} ctx
 */
export function renderRoadmap(container, trophies, ctx) {
  const { earned, spoiler, selectedId, onSelect } = ctx;
  container.replaceChildren();

  for (const stage of [1, 2, 3]) {
    const meta = STAGE_META[stage];
    const items = trophies
      .filter((t) => t.roadmapStage === stage)
      .sort((a, b) => a.id - b.id);
    if (items.length === 0) continue;

    const block = document.createElement('div');
    block.className = 'stage-block';

    const h2 = document.createElement('h2');
    h2.textContent = `${meta.title} (${items.length} trophies)`;
    const sub = document.createElement('p');
    sub.className = 'stage-sub';
    sub.textContent = meta.sub;
    block.append(h2, sub);

    const grid = document.createElement('div');
    grid.className = 'stage-grid';

    for (const t of items) {
      const isEarned = earned.has(t.name);
      const label = rowLabel(t, spoiler, isEarned);

      const row = document.createElement('div');
      row.className = 'trophy-item' + (isEarned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
      row.dataset.id = String(t.id);

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = isEarned;
      box.addEventListener('click', (e) => e.stopPropagation());
      box.addEventListener('change', () => {
        ctx.onToggleEarned(t, box.checked);
      });

      const body = document.createElement('div');
      body.className = 'ti-body';
      const title = document.createElement('div');
      title.className = 'ti-title';
      const nameSpan = document.createElement('span');
      nameSpan.textContent = label.name;
      title.append(nameSpan);

      const gBadge = document.createElement('span');
      gBadge.className = `badge grade ${t.grade}`;
      gBadge.textContent = gradeLabel(t.grade);
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
      desc.textContent = label.desc;

      body.append(title, desc);
      row.append(box, body);
      row.addEventListener('click', () => onSelect(t.id));
      grid.append(row);
    }

    block.append(grid);
    container.append(block);
  }
}
