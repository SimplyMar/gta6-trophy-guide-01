// GTA VI offline trophy tracker. Loads app/data/trophies.json once, renders a master-detail
// checklist and a Platinum Roadmap view, keeps earned progress in localStorage, and supports
// JSON export/import. Also reads ?shot= style query params so headless screenshots can set up a
// deterministic view, then flips window.__shotReady = true once that view has painted.
import { renderRoadmap } from './roadmap.js';

const KEY = 'gta6-trophy-tracker:earned';

const els = {
  tabChecklist: document.getElementById('tabChecklist'),
  tabRoadmap: document.getElementById('tabRoadmap'),
  checklistPane: document.getElementById('checklistPane'),
  roadmapPane: document.getElementById('roadmapPane'),
  trophyList: document.getElementById('trophyList'),
  roadmapStages: document.getElementById('roadmapStages'),
  search: document.getElementById('search'),
  category: document.getElementById('category'),
  grade: document.getElementById('grade'),
  spoiler: document.getElementById('spoiler'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  progress: document.getElementById('progress'),
  progressFill: document.getElementById('progressFill'),
  detailEmpty: document.getElementById('detailEmpty'),
  detailCard: document.getElementById('detailCard'),
  dGrade: document.getElementById('dGrade'),
  dMissable: document.getElementById('dMissable'),
  dHiddenFlag: document.getElementById('dHiddenFlag'),
  dName: document.getElementById('dName'),
  dDesc: document.getElementById('dDesc'),
  dCategory: document.getElementById('dCategory'),
  dStage: document.getElementById('dStage'),
  dGuide: document.getElementById('dGuide'),
  dSourceLink: document.getElementById('dSourceLink'),
  dEarned: document.getElementById('dEarned'),
};

const params = new URLSearchParams(location.search);

/** @type {{earned: Set<string>, view: 'checklist'|'roadmap', search: string, category: string, grade: string, spoiler: boolean, selectedId: number|null}} */
const state = {
  earned: loadEarned(),
  view: params.get('view') === 'roadmap' ? 'roadmap' : 'checklist',
  search: '',
  category: params.get('category') ?? 'all',
  grade: params.get('grade') ?? 'all',
  spoiler: params.get('spoiler') === '1',
  selectedId: params.has('selected') ? Number(params.get('selected')) : null,
};

function loadEarned() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(KEY, JSON.stringify([...state.earned]));
}

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

// ?earned=N applied once trophies are known: marks the first N trophies (by id) as earned, so a
// screenshot can show deterministic progress without touching localStorage history.
if (params.has('earned')) {
  const n = Number(params.get('earned'));
  if (Number.isFinite(n) && n >= 0) {
    state.earned = new Set(trophies.filter((t) => t.id <= n).map((t) => t.name));
  }
}

if (state.selectedId === null && trophies.length > 0) {
  state.selectedId = trophies[0].id;
}

function applyControlsToUi() {
  els.category.value = state.category;
  els.grade.value = state.grade;
  els.spoiler.checked = state.spoiler;
  setActiveTab(state.view);
}

function setActiveTab(view) {
  state.view = view;
  els.tabChecklist.classList.toggle('active', view === 'checklist');
  els.tabRoadmap.classList.toggle('active', view === 'roadmap');
  els.tabChecklist.setAttribute('aria-selected', String(view === 'checklist'));
  els.tabRoadmap.setAttribute('aria-selected', String(view === 'roadmap'));
  els.checklistPane.classList.toggle('hidden', view !== 'checklist');
  els.roadmapPane.classList.toggle('hidden', view !== 'roadmap');
}

function filteredTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.category !== 'all' && t.category !== state.category) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function labelFor(t) {
  const isEarned = state.earned.has(t.name);
  const reveal = state.spoiler || isEarned;
  if (t.hidden && !reveal) return { name: 'Hidden Trophy', desc: 'Spoiler-protected — enable Spoiler mode or earn it to reveal.' };
  return { name: t.name, desc: t.description };
}

function renderChecklist() {
  els.trophyList.replaceChildren();
  const list = filteredTrophies();
  for (const t of list) {
    const isEarned = state.earned.has(t.name);
    const label = labelFor(t);

    const li = document.createElement('li');
    li.className = 'trophy-item' + (isEarned ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '');
    li.dataset.id = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => toggleEarned(t, box.checked));

    const body = document.createElement('div');
    body.className = 'ti-body';
    const title = document.createElement('div');
    title.className = 'ti-title';
    const nameSpan = document.createElement('span');
    nameSpan.textContent = label.name;
    title.append(nameSpan);

    const gBadge = document.createElement('span');
    gBadge.className = `badge grade ${t.grade}`;
    gBadge.textContent = t.grade[0].toUpperCase() + t.grade.slice(1);
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
    li.append(box, body);
    li.addEventListener('click', () => selectTrophy(t.id));
    els.trophyList.append(li);
  }
}

function renderRoadmapView() {
  renderRoadmap(els.roadmapStages, trophies, {
    earned: state.earned,
    spoiler: state.spoiler,
    selectedId: state.selectedId,
    onSelect: selectTrophy,
    onToggleEarned: toggleEarned,
  });
}

function renderDetail() {
  const t = trophies.find((x) => x.id === state.selectedId);
  if (!t) {
    els.detailEmpty.classList.remove('hidden');
    els.detailCard.classList.add('hidden');
    return;
  }
  els.detailEmpty.classList.add('hidden');
  els.detailCard.classList.remove('hidden');

  const isEarned = state.earned.has(t.name);
  const reveal = state.spoiler || isEarned;

  els.dGrade.className = `badge grade ${t.grade}`;
  els.dGrade.textContent = t.grade[0].toUpperCase() + t.grade.slice(1);
  els.dMissable.classList.toggle('hidden', !t.missable);
  els.dHiddenFlag.classList.toggle('hidden', !t.hidden);

  els.dName.textContent = reveal ? t.name : 'Hidden Trophy';
  els.dDesc.textContent = reveal ? t.description : 'Spoiler-protected — enable Spoiler mode or earn it to reveal.';
  els.dCategory.textContent = `Category: ${t.category}`;
  els.dStage.textContent = `Roadmap Stage ${t.roadmapStage}`;
  els.dGuide.textContent = reveal ? t.guide : 'Guide hidden until spoilers are enabled or the trophy is earned.';
  els.dSourceLink.textContent = t.source.name;
  els.dSourceLink.href = t.source.url;
  els.dEarned.checked = isEarned;
}

function renderProgress() {
  els.progress.textContent = `${state.earned.size} / ${trophies.length} earned`;
  els.progressFill.style.width = `${Math.round((state.earned.size / trophies.length) * 100)}%`;
}

function renderAll() {
  renderChecklist();
  renderRoadmapView();
  renderDetail();
  renderProgress();
}

function selectTrophy(id) {
  state.selectedId = id;
  renderAll();
}

function toggleEarned(t, isEarned) {
  if (isEarned) state.earned.add(t.name);
  else state.earned.delete(t.name);
  saveEarned();
  renderAll();
}

els.tabChecklist.addEventListener('click', () => {
  setActiveTab('checklist');
  renderAll();
});
els.tabRoadmap.addEventListener('click', () => {
  setActiveTab('roadmap');
  renderAll();
});
els.search.addEventListener('input', () => {
  state.search = els.search.value;
  renderChecklist();
});
els.category.addEventListener('change', () => {
  state.category = els.category.value;
  renderAll();
});
els.grade.addEventListener('change', () => {
  state.grade = els.grade.value;
  renderAll();
});
els.spoiler.addEventListener('change', () => {
  state.spoiler = els.spoiler.checked;
  renderAll();
});
els.dEarned.addEventListener('change', () => {
  const t = trophies.find((x) => x.id === state.selectedId);
  if (t) toggleEarned(t, els.dEarned.checked);
});

els.exportBtn.addEventListener('click', () => {
  const payload = { game: 'GTA VI', platform: 'PS5', earned: [...state.earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

els.importInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.earned) ? parsed.earned : null;
    if (!list) throw new Error('not a recognized progress file');
    state.earned = new Set(list);
    saveEarned();
    renderAll();
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    els.importInput.value = '';
  }
});

applyControlsToUi();
renderAll();

// Signal to a headless screenshot harness that the requested view has fully painted.
requestAnimationFrame(() => requestAnimationFrame(() => {
  window.__shotReady = true;
}));
