interface MigrationMeta {
  id: string;
  label: string;
  disabled: boolean;
}

interface InstanceInfo {
  id: string;
  name: string;
  pageName: string;
  parentName: string;
  properties: Record<string, string>;
}

let scope: 'document' | 'selection' = 'document';
let instances: InstanceInfo[] = [];
let selected = new Set<string>();
let currentMigrationId: string | null = null;

const migrationList  = document.getElementById('migration-list')!;
const btnPage        = document.getElementById('btn-page')! as HTMLButtonElement;
const btnSelection   = document.getElementById('btn-selection')! as HTMLButtonElement;
const btnScan        = document.getElementById('btn-scan')! as HTMLButtonElement;
const btnExecute     = document.getElementById('btn-execute')! as HTMLButtonElement;
const btnCancel      = document.getElementById('btn-cancel')! as HTMLButtonElement;
const report         = document.getElementById('report')!;
const instanceList   = document.getElementById('instance-list')!;
const emptyState     = document.getElementById('empty-state')!;
const countBadge     = document.getElementById('count-badge')!;
const selectAll      = document.getElementById('select-all')! as HTMLInputElement;
const toast          = document.getElementById('toast')!;
const targetWarning  = document.getElementById('target-warning')!;

// ── Tab navigation ────────────────────────────

document.querySelectorAll<HTMLButtonElement>('.nav-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('[id^="panel-"]').forEach(p => p.classList.add('hidden'));
    document.getElementById('panel-' + tab.dataset.tab)?.classList.remove('hidden');
  };
});

// ── Scope ─────────────────────────────────────

btnPage.onclick = () => {
  scope = 'document';
  btnPage.classList.add('active');
  btnSelection.classList.remove('active');
};

btnSelection.onclick = () => {
  scope = 'selection';
  btnSelection.classList.add('active');
  btnPage.classList.remove('active');
};

// ── Scan ──────────────────────────────────────

btnScan.onclick = () => {
  if (!currentMigrationId) return;
  btnScan.innerHTML = '<span class="spinner"></span>Analyse en cours…';
  btnScan.disabled = true;
  report.classList.add('hidden');
  btnExecute.classList.add('hidden');
  parent.postMessage({ pluginMessage: { type: 'scan', migrationId: currentMigrationId, scope } }, '*');
};

// ── Execute ───────────────────────────────────

btnExecute.onclick = () => {
  if (selected.size === 0) return;
  btnExecute.innerHTML = '<span class="spinner"></span>Application…';
  btnExecute.disabled = true;
  parent.postMessage({
    pluginMessage: { type: 'execute-swaps', migrationId: currentMigrationId, instanceIds: [...selected] },
  }, '*');
};

btnCancel.onclick = () => parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');

// ── Select all ────────────────────────────────

selectAll.onchange = () => {
  instances.forEach(i => selectAll.checked ? selected.add(i.id) : selected.delete(i.id));
  document.querySelectorAll<HTMLInputElement>('.inst-checkbox').forEach(cb => {
    cb.checked = selectAll.checked;
  });
  updateExecuteBtn();
};

// ── Helpers ───────────────────────────────────

function updateExecuteBtn() {
  btnExecute.disabled = selected.size === 0;
  btnExecute.textContent = selected.size > 0
    ? `Appliquer (${selected.size} swap${selected.size > 1 ? 's' : ''})`
    : 'Appliquer';
}

function renderMigrations(migrations: MigrationMeta[]) {
  migrationList.innerHTML = '';
  let firstEnabled = true;

  migrations.forEach(m => {
    const item = document.createElement('label');
    item.className = 'migration-item' + (m.disabled ? ' disabled' : '');

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'migration';
    radio.value = m.id;
    radio.disabled = m.disabled;

    if (!m.disabled && firstEnabled) {
      radio.checked = true;
      item.classList.add('active');
      currentMigrationId = m.id;
      firstEnabled = false;
    }

    const label = document.createElement('span');
    label.className = 'migration-label';
    label.textContent = m.label;

    radio.onchange = () => {
      document.querySelectorAll('.migration-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      currentMigrationId = m.id;
      report.classList.add('hidden');
      btnExecute.classList.add('hidden');
    };

    item.appendChild(radio);
    item.appendChild(label);

    if (m.disabled) {
      const badge = document.createElement('span');
      badge.className = 'soon-badge';
      badge.textContent = 'Bientôt';
      item.appendChild(badge);
    }

    migrationList.appendChild(item);
  });

  btnScan.disabled = migrations.filter(m => !m.disabled).length === 0;
}

function renderInstances(list: InstanceInfo[]) {
  instanceList.innerHTML = '';

  if (list.length === 0) {
    emptyState.classList.remove('hidden');
    instanceList.classList.add('hidden');
    btnExecute.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  instanceList.classList.remove('hidden');
  btnExecute.classList.remove('hidden');

  list.forEach(inst => {
    const item = document.createElement('label');
    item.className = 'instance-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'inst-checkbox';
    cb.checked = true;
    (cb as HTMLInputElement & { dataset: DOMStringMap }).dataset.id = inst.id;
    cb.onclick = e => e.stopPropagation();
    cb.onchange = () => {
      cb.checked ? selected.add(inst.id) : selected.delete(inst.id);
      selectAll.checked = selected.size === instances.length;
      updateExecuteBtn();
    };

    const info = document.createElement('div');
    info.className = 'instance-info';
    info.innerHTML = `
      <div class="instance-name">${inst.name}</div>
      <div class="instance-meta">${inst.pageName} · ${inst.parentName}</div>
    `;

    item.appendChild(cb);
    item.appendChild(info);

    const propEntries = Object.entries(inst.properties ?? {});
    if (propEntries.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'prop-tags';
      propEntries.forEach(([key, val]) => {
        const tag = document.createElement('span');
        tag.className = 'prop-tag';
        tag.textContent = `${key}: ${val}`;
        tags.appendChild(tag);
      });
      item.appendChild(tags);
    }

    instanceList.appendChild(item);
  });
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string, type: 'success' | 'error') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type} visible`;
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ── Plugin messages ───────────────────────────

window.onmessage = (event: MessageEvent) => {
  const msg = event.data?.pluginMessage;
  if (!msg) return;

  if (msg.type === 'migrations') {
    renderMigrations(msg.migrations);
  }

  if (msg.type === 'scan-result') {
    btnScan.textContent = 'Analyser';
    btnScan.disabled = false;
    instances = msg.instances ?? [];
    selected = new Set(instances.map((i: InstanceInfo) => i.id));
    selectAll.checked = true;
    countBadge.textContent = String(instances.length);
    report.classList.remove('hidden');

    targetWarning.classList.toggle('hidden', msg.targetFound !== false);
    if (!msg.targetFound) btnExecute.classList.add('hidden');

    renderInstances(instances);
    updateExecuteBtn();
  }

  if (msg.type === 'swap-done') {
    const { swapped, failed } = msg;
    const text = failed > 0
      ? `${swapped} swap${swapped > 1 ? 's' : ''} OK · ${failed} échec${failed > 1 ? 's' : ''}`
      : `${swapped} swap${swapped > 1 ? 's' : ''} effectué${swapped > 1 ? 's' : ''} ✓`;
    showToast(text, failed > 0 ? 'error' : 'success');
    if (swapped > 0) {
      parent.postMessage({ pluginMessage: { type: 'scan', migrationId: currentMigrationId, scope } }, '*');
    } else {
      btnExecute.disabled = false;
      updateExecuteBtn();
    }
  }

  if (msg.type === 'error') {
    btnScan.textContent = 'Analyser';
    btnScan.disabled = false;
    btnExecute.disabled = false;
    showToast(msg.message, 'error');
  }
};

parent.postMessage({ pluginMessage: { type: 'get-migrations' } }, '*');
