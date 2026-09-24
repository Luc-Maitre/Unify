export function UiKitPanel() {
  return (
    <div class="tool-panel">
      <div class="uikit-section">
        <div class="uikit-section-title">Typographie</div>
        <div class="uikit-row uikit-wrap">
          <span class="section-label" style={{ margin: 0 }}>Section label</span>
          <span style={{ fontSize: '20px', fontWeight: 900 }}>H1 20/900</span>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>H2 18/600</span>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>H3 16/600</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Body HL 14/600</span>
          <span style={{ fontSize: '14px', fontWeight: 400 }}>Body 14/400</span>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>Label 12/500</span>
          <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--color-neutral)' }}>Meta 10/400</span>
          <span style={{ fontSize: '9px', fontWeight: 500 }}>Caption 9/500</span>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Boutons</div>
        <div class="uikit-row uikit-wrap">
          <button class="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Analyser</button>
          <button class="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} disabled>Désactivé</button>
          <button class="btn-action" style={{ flex: 'none', height: '44px', padding: '0 24px' }}>Appliquer (3 swaps)</button>
          <button class="btn-ghost" style={{ flex: 'none', padding: '9px 16px' }}>Retour</button>
        </div>
        <div class="uikit-row uikit-wrap" style={{ marginTop: '8px' }}>
          <button class="scope-btn active" style={{ flex: 'none', width: 'auto', padding: '8px 16px' }}>Tout le document</button>
          <button class="scope-btn" style={{ flex: 'none', width: 'auto', padding: '8px 16px' }}>Sélection</button>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Chips</div>
        <div class="chip-row">
          <button class="chip active" data-label="Tout">Tout</button>
          <button class="chip" data-label="Rebranding">Rebranding</button>
          <button class="chip" data-label="Quotidien">Quotidien</button>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Tags & Badges</div>
        <div class="uikit-row uikit-wrap">
          <span class="badge">0</span>
          <span class="badge">12</span>
          <span class="tag-new">NOUVEAU</span>
          <span class="tag-soon">BIENTÔT</span>
          <span class="tag-category">QUOTIDIEN</span>
          <span class="soon-badge">Bientôt</span>
          <span class="prop-tag">appearance: primary</span>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Tool cards</div>
        <div class="tool-grid" style={{ pointerEvents: 'none' }}>
          <div class="tool-card">
            <div class="tool-card-content">
              <div class="tool-card-header">
                <div class="tool-pastille">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3.5L3 1.5L1 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 1.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M11 12.5L13 14.5L15 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13 14.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <span class="tool-card-title">Easy Swap</span>
              </div>
              <p class="tool-card-desc">Description de l'outil.</p>
            </div>
            <div class="tool-card-tags"><span class="tag-category">QUOTIDIEN</span></div>
          </div>
          <div class="tool-card disabled">
            <div class="tool-card-content">
              <div class="tool-card-header">
                <div class="tool-pastille">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M5 7V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <span class="tool-card-title">Title</span>
                <span class="tag-soon">BIENTÔT</span>
              </div>
              <p class="tool-card-desc">Description de l'outil.</p>
            </div>
            <div class="tool-card-tags"><span class="tag-category">CATÉGORIE</span></div>
          </div>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Migration items</div>
        <div class="migration-list" style={{ pointerEvents: 'none' }}>
          <label class="migration-item active">
            <input type="radio" name="uikit-migration" checked />
            <span class="migration-label">Buttons & Icon Buttons</span>
          </label>
          <label class="migration-item disabled">
            <input type="radio" name="uikit-migration" disabled />
            <span class="migration-label">Chips</span>
            <span class="soon-badge">Bientôt</span>
          </label>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Instance items</div>
        <div class="instance-list" style={{ maxHeight: 'none', pointerEvents: 'none' }}>
          <label class="instance-item">
            <input type="checkbox" checked />
            <div class="instance-info">
              <div class="instance-name">Button / Primary</div>
              <div class="instance-meta">Page 1 · Hero Section</div>
            </div>
            <div class="prop-tags"><span class="prop-tag">appearance: primary</span></div>
          </label>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Feedback</div>
        <div class="warning">⚠️ Composant cible introuvable dans le document — vérifiez la config.</div>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div class="toast success" style={{ position: 'static', opacity: 1, transform: 'none', pointerEvents: 'none' }}>3 swaps effectués ✓</div>
          <div class="toast error" style={{ position: 'static', opacity: 1, transform: 'none', pointerEvents: 'none' }}>2 swaps OK · 1 échec</div>
        </div>
        <div class="empty-state" style={{ marginTop: '8px' }}>Aucune instance trouvée.</div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Spinners</div>
        <div class="uikit-row" style={{ gap: '16px' }}>
          <span class="spinner" style={{ borderTopColor: 'var(--color-on-primary)' }} />
          <span class="preview-spinner" />
        </div>
      </div>
    </div>
  );
}
