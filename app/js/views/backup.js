// A clean Export/Import view: a JSON preview of the current save, a download-file button, a
// styled file-picker label (never the raw unstyled browser "Choose file" button), and a
// copy-to-clipboard button.

export function renderBackup(root, store, { game, onImport } = {}) {
  root.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'backup-view';

  const payload = store.exportPayload(game);
  const json = JSON.stringify(payload, null, 2);

  wrap.innerHTML = `
    <h2>Export / Import Progress</h2>
    <p class="view-intro">Your earned trophies, PSN progress counters, notes and Spoiler Shield setting all live in this
    one JSON file. Export it to back up or move between browsers; import it to restore.</p>
  `;

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
  fileLabel.textContent = 'Choose Progress File…';
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

  const previewHead = document.createElement('h3');
  previewHead.textContent = 'JSON Preview';
  wrap.append(previewHead);

  const pre = document.createElement('pre');
  pre.className = 'json-preview';
  pre.textContent = json;
  wrap.append(pre);

  root.append(wrap);
}
