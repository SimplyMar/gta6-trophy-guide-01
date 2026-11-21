// A clean Export/Import view: a JSON preview of the current save, a download-file button, a
// styled file-picker label, and a copy-to-clipboard button. Also supports compact rendering for the right panel.

export function renderBackup(root, store, { game, onImport, compact = false } = {}) {
  root.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = compact ? 'backup-panel-card' : 'backup-view';

  const payload = store.exportPayload(game);
  const json = JSON.stringify(payload, null, 2);

  if (compact) {
    // Dual Showcase mode for ?panel=backup in right pane
    wrap.innerHTML = `
      <div class="shield-status-card">
        <div class="shield-status-head">
          <span class="shield-icon">🛡️</span>
          <div>
            <h3>Spoiler Shield Active</h3>
            <p>Masking unearned secret storyline trophies on the checklist. Earned story milestones stay visible with checkmarks.</p>
          </div>
        </div>
      </div>

      <div class="backup-header-compact">
        <h3>Live Save Backup &amp; LocalStorage State</h3>
        <p class="backup-subtext">LocalStorage sync active · ${payload.earned.length} earned · ${Object.keys(payload.progress).length} active counters</p>
      </div>
    `;
  } else {
    wrap.innerHTML = `
      <h2>Export / Import Progress</h2>
      <p class="view-intro">Your earned trophies, PSN progress counters, notes and Spoiler Shield setting all live in this
      one JSON file. Export it to back up or move between browsers; import it to restore.</p>
    `;
  }

  const actions = document.createElement('div');
  actions.className = 'backup-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn btn-primary';
  downloadBtn.type = 'button';
  downloadBtn.textContent = 'Download JSON';
  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = 'leonida-platinum-casebook-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-ghost';
  copyBtn.type = 'button';
  copyBtn.textContent = 'Copy JSON';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(json);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy JSON'), 1500);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => (copyBtn.textContent = 'Copy JSON'), 1500);
    }
  });

  const fileLabel = document.createElement('label');
  fileLabel.className = 'btn btn-ghost file-label';
  fileLabel.textContent = 'Choose File…';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.className = 'visually-hidden';
  fileLabel.append(fileInput);

  const status = document.createElement('span');
  status.className = 'import-status';

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      onImport?.(parsed);
      status.textContent = `Imported ${file.name}.`;
      status.classList.remove('error');
    } catch (err) {
      status.textContent = `Import failed: ${err.message}`;
      status.classList.add('error');
    } finally {
      fileInput.value = '';
    }
  });

  actions.append(downloadBtn, copyBtn, fileLabel, status);
  wrap.append(actions);

  const previewHead = document.createElement('h4');
  previewHead.className = 'preview-title';
  previewHead.textContent = 'Live JSON Payload Preview';
  wrap.append(previewHead);

  const pre = document.createElement('pre');
  pre.className = 'json-preview';
  pre.textContent = json;
  wrap.append(pre);

  root.append(wrap);
}
