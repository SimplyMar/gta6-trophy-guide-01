// Boot: loads data, wires up the store, routes URL query params (seed, view, category, grade,
// status, search, spoiler, selected, panel) to state, wires filters and keyboard shortcuts, and renders
// every view. Also flags window.__shotReady for headless screenshot capture once painted.
//
// Secondary views (roadmap, missables, backup) are loaded on-demand via dynamic import() to keep
// the initial first-load footprint ultra-lean.

import { loadData, gradeTotals, missableCount, onlineCount } from './data.js';
import { createStore } from './store.js';
import { applyFilters } from './filters.js';
import { renderChecklist } from './views/checklist.js';
import { renderDetail } from './views/detail.js';

const GRADE_LABEL = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const VIEWS = ['checklist', 'roadmap', 'missables', 'backup'];

// Lazy-loaded module caches for secondary views
let roadmapModule = null;
let missablesModule = null;
let backupModule = null;

async function getRoadmapModule() {
  if (!roadmapModule) roadmapModule = await import('./views/roadmap.js');
  return roadmapModule;
}
async function getMissablesModule() {
  if (!missablesModule) missablesModule = await import('./views/missables.js');
  return missablesModule;
}
async function getBackupModule() {
  if (!backupModule) backupModule = await import('./views/backup.js');
  return backupModule;
}

const params = new URLSearchParams(location.search);
const seeded = params.get('seed') === 'demo';

const doc = await loadData();
const trophies = doc.trophies;
const store = createStore(seeded);

const els = {
  viewRoot: document.getElementById('viewRoot'),
  detailPane: document.getElementById('detailPane'),
  controls: document.getElementById('controls'),
  tabs: [...document.querySelectorAll('.tab')],
  search: document.getElementById('search'),
  categoryFilter: document.getElementById('categoryFilter'),
  gradeFilter: document.getElementById('gradeFilter'),
  statusFilter: document.getElementById('statusFilter'),
  spoilerShield: document.getElementById('spoilerShield'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  gradePills: document.getElementById('gradePills'),
  missableBadge: document.getElementById('missableBadge'),
  onlineBadge: document.getElementById('onlineBadge'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  panelBackupBtn: document.getElementById('panelBackupBtn'),
  layout: document.getElementById('layout'),
};

const firstNonHiddenId = trophies.find((t) => !t.hidden)?.id ?? trophies[0]?.id ?? null;

const state = {
  view: VIEWS.includes(params.get('view')) ? params.get('view') : 'checklist',
  search: params.get('q') ?? '',
  category: params.get('category') ?? 'all',
  grade: params.get('grade') ?? 'all',
  status: params.get('status') ?? 'all',
  selectedId: params.has('selected') ? Number(params.get('selected')) : firstNonHiddenId,
  panelBackup: params.get('panel') === 'backup',
};

if (params.get('spoiler') === '1') store.setShield(true);
else if (params.get('spoiler') === '0') store.setShield(false);

function syncControlsToState() {
  els.search.value = state.search;
  els.categoryFilter.value = state.category;
  els.gradeFilter.value = state.grade;
  els.statusFilter.value = state.status;
  els.spoilerShield.checked = store.getShield();

  for (const tab of els.tabs) {
    const active = tab.dataset.view === state.view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }

  els.controls.classList.toggle('hidden', state.view === 'backup');
  els.layout.classList.toggle('full-width', state.view === 'backup');
  if (els.panelBackupBtn) {
    els.panelBackupBtn.classList.toggle('active', state.panelBackup);
  }
}

function renderHeader() {
  const totals = gradeTotals(trophies);
  const earned = store.earnedCount();
  els.progressText.textContent = `${earned} / ${trophies.length} earned`;
  els.progressFill.style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  els.gradePills.innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<span class="pill pill-${g}">${totals[g]}${GRADE_LABEL[g]}</span>`)
    .join('');
  els.missableBadge.textContent = `${missableCount(trophies)} Missable`;
  els.onlineBadge.textContent = `Online: ${onlineCount(trophies)}`;
}

function selectTrophy(id) {
  state.selectedId = id;
  state.panelBackup = false;
  renderAll();
}

function toggleEarned(t, earned) {
  store.setEarned(t.id, earned);
  renderAll();
}

function changeProgress(t, value) {
  store.setProgress(t.id, value, t.psnTarget);
  renderAll();
}

function changeNote(t, text) {
  store.setNote(t.id, text);
}

function handleImport(payload) {
  store.importPayload(payload);
  renderAll();
}

function currentSelected() {
  return trophies.find((t) => t.id === state.selectedId) ?? null;
}

async function renderDetailPane() {
  if (state.view === 'backup') {
    els.detailPane.classList.add('hidden');
    return;
  }
  els.detailPane.classList.remove('hidden');

  if (state.panelBackup) {
    const backupMod = await getBackupModule();
    backupMod.renderBackup(els.detailPane, store, {
      game: doc.game,
      onImport: handleImport,
      compact: true,
    });
    return;
  }

  renderDetail(els.detailPane, currentSelected(), store, {
    onToggleEarned: toggleEarned,
    onProgressChange: changeProgress,
    onNoteChange: changeNote,
  });
}

async function renderAll() {
  renderHeader();
  syncControlsToState();

  if (state.view === 'checklist') {
    const filtered = applyFilters(trophies, store, state);
    renderChecklist(els.viewRoot, filtered, store, {
      selectedId: state.selectedId,
      onSelect: selectTrophy,
      onToggleEarned: toggleEarned,
    });
  } else if (state.view === 'roadmap') {
    const mod = await getRoadmapModule();
    mod.renderRoadmap(els.viewRoot, doc, store, {
      selectedId: state.selectedId,
      onSelect: selectTrophy,
      onToggleEarned: toggleEarned,
    });
  } else if (state.view === 'missables') {
    const mod = await getMissablesModule();
    mod.renderMissables(els.viewRoot, trophies, store, {
      selectedId: state.selectedId,
      onSelect: selectTrophy,
      onProgressChange: changeProgress,
    });
  } else if (state.view === 'backup') {
    const mod = await getBackupModule();
    mod.renderBackup(els.viewRoot, store, {
      game: doc.game,
      onImport: handleImport,
      compact: false,
    });
  }

  await renderDetailPane();
}

function setView(view) {
  state.view = view;
  state.panelBackup = false;
  renderAll();
}

for (const tab of els.tabs) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
}

els.search.addEventListener('input', () => {
  state.search = els.search.value;
  renderAll();
});
els.categoryFilter.addEventListener('change', () => {
  state.category = els.categoryFilter.value;
  renderAll();
});
els.gradeFilter.addEventListener('change', () => {
  state.grade = els.gradeFilter.value;
  renderAll();
});
els.statusFilter.addEventListener('change', () => {
  state.status = els.statusFilter.value;
  renderAll();
});
els.spoilerShield.addEventListener('change', () => {
  store.setShield(els.spoilerShield.checked);
  renderAll();
});

if (els.panelBackupBtn) {
  els.panelBackupBtn.addEventListener('click', () => {
    state.panelBackup = !state.panelBackup;
    renderAll();
  });
}

els.exportBtn.addEventListener('click', () => {
  const payload = store.exportPayload(doc.game);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-casebook-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

els.importInput.addEventListener('change', async () => {
  const file = els.importInput.files[0];
  if (!file) return;
  try {
    handleImport(JSON.parse(await file.text()));
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    els.importInput.value = '';
  }
});

// Keyboard shortcuts: 1-4 switch views, / focuses search, Escape blurs it.
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  if (e.key >= '1' && e.key <= '4') setView(VIEWS[Number(e.key) - 1]);
  else if (e.key === '/') {
    e.preventDefault();
    els.search.focus();
  }
});

await renderAll();

// Signal to headless screenshot harness that the requested view has fully painted.
requestAnimationFrame(() => requestAnimationFrame(() => {
  window.__shotReady = true;
}));
