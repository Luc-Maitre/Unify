import { useState } from 'preact/hooks';
import cursorIcon from '../assets/Cursor.svg';
import fileIcon from '../assets/File.svg';
import megaphoneIcon from '../assets/Megaphone.svg';
import sortIcon from '../assets/Sort.svg';
import { CheckboxCard } from './CheckboxCard';
import { LogoMotion } from './LogoMotion';
import { ActionBar } from './ActionBar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Feedback } from './Feedback';
import { IconContainer } from './IconContainer';
import { SelectionCard } from './SelectionCard';
import { Stepper } from './Stepper';
import { Tag } from './Tag';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';

export function UiKitPanel() {
  const [lightMode, setLightMode] = useState(false);
  const [storageReset, setStorageReset] = useState(false);

  function toggleLightMode(enabled: boolean) {
    setLightMode(enabled);
    document.documentElement.classList.toggle('light', enabled);
  }

  function resetStorage() {
    parent.postMessage({ pluginMessage: { type: 'reset-storage' } }, '*');
    setStorageReset(true);
    setTimeout(() => setStorageReset(false), 2000);
  }

  return (
    <div class="tool-panel">
      <div class="uikit-section">
        <div class="uikit-section-title">Debug</div>
        <Button appearance="tertiary" onClick={resetStorage}>
          {storageReset ? '✓ Mémoire réinitialisée' : 'Reset mémoire plugin'}
        </Button>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Thème</div>
        <label class="uikit-row" style={{ gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            class="checkbox"
            checked={lightMode}
            onChange={(e) => toggleLightMode((e.target as HTMLInputElement).checked)}
          />
          <span style={{ fontSize: 'var(--text-label-size)', fontWeight: 'var(--text-label-weight)' }}>
            Light mode
          </span>
        </label>
      </div>

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
          <Button appearance="primary">Primary</Button>
          <Button appearance="secondary">Secondary</Button>
          <Button appearance="tertiary">Tertiary</Button>
        </div>
        <div class="uikit-row uikit-wrap" style={{ marginTop: '8px' }}>
          <Button appearance="primary" disabled>Désactivé</Button>
          <Button appearance="secondary" disabled>Désactivé</Button>
          <Button appearance="tertiary" disabled>Désactivé</Button>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Sticky bar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 -16px' }}>
          <ActionBar primaryLabel="Appliquer" onPrimary={() => {}} />
          <ActionBar
            primaryLabel="Appliquer"
            onPrimary={() => {}}
            secondaryLabel="Annuler"
            onSecondary={() => {}}
          />
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Checkbox</div>
        <div class="uikit-row" style={{ gap: '16px', alignItems: 'center' }}>
          <Checkbox />
          <Checkbox checked />
          <Checkbox disabled />
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Radio</div>
        <div class="uikit-row" style={{ gap: '16px', alignItems: 'center' }}>
          <Radio name="uikit-radio" />
          <Radio name="uikit-radio" checked />
          <Radio name="uikit-radio" disabled />
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Selection cards</div>
        <div class="scope-row" style={{ pointerEvents: 'none' }}>
          <SelectionCard
            title="Tout le document"
            icon={<img src={fileIcon} alt="" />}
          />
          <SelectionCard
            title="Sélection"
            selected
            icon={<img src={cursorIcon} alt="" />}
          />
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
          <Badge value={0} />
          <Badge value={12} />
          <Stepper value={1} />
          <Stepper value={2} />
          <Tag variant="new">NOUVEAU</Tag>
          <Tag variant="tertiary">BIENTÔT</Tag>
          <Tag variant="default">QUOTIDIEN</Tag>
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
                <IconContainer size="medium">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.81577 5.02583C7.56282 5.29144 7.14415 5.30005 6.88065 5.04507L5.32807 3.56419L5.32807 11.3334C5.32807 11.7016 5.03197 12 4.66671 12C4.30144 12 4.00534 11.7016 4.00534 11.3334L4.00534 3.56419L2.45276 5.04507C2.18926 5.30005 1.7706 5.29144 1.51764 5.02583C1.26468 4.76022 1.27323 4.3382 1.53672 4.08322L4.20869 1.51912C4.46461 1.27146 4.8688 1.27146 5.12472 1.51912L7.79669 4.08322C8.06019 4.3382 8.06873 4.76022 7.81577 5.02583Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.18431 10.9743C8.43726 10.7086 8.85593 10.7 9.11943 10.955L10.672 12.4359V4.66671C10.672 4.29852 10.9681 4.00004 11.3334 4.00004C11.6986 4.00004 11.9947 4.29852 11.9947 4.66671V12.4359L13.5473 10.955C13.8108 10.7 14.2295 10.7086 14.4824 10.9743C14.7354 11.2399 14.7269 11.6619 14.4634 11.9169L11.7914 14.481C11.5355 14.7286 11.1313 14.7286 10.8754 14.481L8.20339 11.9169C7.93989 11.6619 7.93135 11.2399 8.18431 10.9743Z" fill="currentColor"/>
                  </svg>
                </IconContainer>
                <span class="tool-card-title">Easy Swap</span>
              </div>
              <p class="tool-card-desc">Description de l'outil.</p>
            </div>
            <div class="tool-card-tags"><Tag variant="default">QUOTIDIEN</Tag></div>
          </div>
          <div class="tool-card disabled">
            <div class="tool-card-content">
              <div class="tool-card-header">
                <IconContainer size="medium">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M5 7V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </IconContainer>
                <span class="tool-card-title">Title</span>
                <Tag variant="tertiary">BIENTÔT</Tag>
              </div>
              <p class="tool-card-desc">Description de l'outil.</p>
            </div>
            <div class="tool-card-tags"><Tag variant="default">CATÉGORIE</Tag></div>
          </div>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Checkbox cards</div>
        <div class="migration-card-list" style={{ pointerEvents: 'none' }}>
          <CheckboxCard label="Buttons & Icon Buttons" checked />
          <CheckboxCard label="Tags" disabled slot={<Tag variant="tertiary">BIENTÔT</Tag>} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Feedback variant="success" title="Opération réussie" description="3 swaps effectués avec succès." />
          <Feedback variant="error" title="Erreur" description="2 swaps OK · 1 échec." />
          <Feedback variant="warning" title="Attention" description="Composant cible introuvable dans le document." />
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Icon container</div>
        <div class="uikit-row" style={{ gap: '12px', alignItems: 'center' }}>
          <IconContainer size="medium">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.81577 5.02583C7.56282 5.29144 7.14415 5.30005 6.88065 5.04507L5.32807 3.56419L5.32807 11.3334C5.32807 11.7016 5.03197 12 4.66671 12C4.30144 12 4.00534 11.7016 4.00534 11.3334L4.00534 3.56419L2.45276 5.04507C2.18926 5.30005 1.7706 5.29144 1.51764 5.02583C1.26468 4.76022 1.27323 4.3382 1.53672 4.08322L4.20869 1.51912C4.46461 1.27146 4.8688 1.27146 5.12472 1.51912L7.79669 4.08322C8.06019 4.3382 8.06873 4.76022 7.81577 5.02583Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.18431 10.9743C8.43726 10.7086 8.85593 10.7 9.11943 10.955L10.672 12.4359V4.66671C10.672 4.29852 10.9681 4.00004 11.3334 4.00004C11.6986 4.00004 11.9947 4.29852 11.9947 4.66671V12.4359L13.5473 10.955C13.8108 10.7 14.2295 10.7086 14.4824 10.9743C14.7354 11.2399 14.7269 11.6619 14.4634 11.9169L11.7914 14.481C11.5355 14.7286 11.1313 14.7286 10.8754 14.481L8.20339 11.9169C7.93989 11.6619 7.93135 11.2399 8.18431 10.9743Z" fill="currentColor"/>
            </svg>
          </IconContainer>
          <IconContainer size="large">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.81577 5.02583C7.56282 5.29144 7.14415 5.30005 6.88065 5.04507L5.32807 3.56419L5.32807 11.3334C5.32807 11.7016 5.03197 12 4.66671 12C4.30144 12 4.00534 11.7016 4.00534 11.3334L4.00534 3.56419L2.45276 5.04507C2.18926 5.30005 1.7706 5.29144 1.51764 5.02583C1.26468 4.76022 1.27323 4.3382 1.53672 4.08322L4.20869 1.51912C4.46461 1.27146 4.8688 1.27146 5.12472 1.51912L7.79669 4.08322C8.06019 4.3382 8.06873 4.76022 7.81577 5.02583Z" fill="currentColor"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.18431 10.9743C8.43726 10.7086 8.85593 10.7 9.11943 10.955L10.672 12.4359V4.66671C10.672 4.29852 10.9681 4.00004 11.3334 4.00004C11.6986 4.00004 11.9947 4.29852 11.9947 4.66671V12.4359L13.5473 10.955C13.8108 10.7 14.2295 10.7086 14.4824 10.9743C14.7354 11.2399 14.7269 11.6619 14.4634 11.9169L11.7914 14.481C11.5355 14.7286 11.1313 14.7286 10.8754 14.481L8.20339 11.9169C7.93989 11.6619 7.93135 11.2399 8.18431 10.9743Z" fill="currentColor"/>
            </svg>
          </IconContainer>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Logo animé</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span class="prop-tag" style={{ alignSelf: 'flex-start' }}>loop={'{false}'}</span>
            <div class="uikit-row" style={{ gap: '8px', alignItems: 'flex-end' }}>
              <LogoMotion width={24} height={24} />
              <LogoMotion width={48} height={48} />
              <LogoMotion width={64} height={64} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span class="prop-tag" style={{ alignSelf: 'flex-start' }}>loop</span>
            <div class="uikit-row" style={{ gap: '8px', alignItems: 'flex-end' }}>
              <LogoMotion width={24} height={24} loop />
              <LogoMotion width={48} height={48} loop />
              <LogoMotion width={64} height={64} loop />
            </div>
          </div>
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Spinners</div>
        <div class="uikit-row" style={{ gap: '16px' }}>
          <span class="spinner" style={{ borderTopColor: 'var(--color-on-primary)' }} />
          <span class="preview-spinner" />
        </div>
      </div>

      <div class="uikit-section">
        <div class="uikit-section-title">Icônes</div>
        <div class="uikit-row uikit-wrap" style={{ gap: '16px' }}>
          <div class="icon-tile-group">
            <div class="icon-tile"><img src={cursorIcon} width="16" height="16" alt="" /></div>
            <span class="icon-tile-label">Cursor</span>
          </div>
          <div class="icon-tile-group">
            <div class="icon-tile"><img src={fileIcon} width="16" height="16" alt="" /></div>
            <span class="icon-tile-label">File</span>
          </div>
          <div class="icon-tile-group">
            <div class="icon-tile"><img src={megaphoneIcon} width="16" height="16" alt="" /></div>
            <span class="icon-tile-label">Megaphone</span>
          </div>
          <div class="icon-tile-group">
            <div class="icon-tile"><img src={sortIcon} width="16" height="16" alt="" /></div>
            <span class="icon-tile-label">Sort</span>
          </div>
          <div class="icon-tile-group">
            <div class="icon-tile">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'white' }}>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3077 4.18427C10.0421 4.43722 10.0335 4.85589 10.2885 5.11939L12.436 7.33863H2.00016C1.63197 7.33863 1.3335 7.63474 1.3335 8C1.3335 8.36526 1.63197 8.66137 2.00016 8.66137H12.436L10.2885 10.8806C10.0335 11.1441 10.0421 11.5628 10.3077 11.8157C10.5733 12.0687 10.9953 12.0601 11.2503 11.7967L14.4811 8.45802C14.7287 8.20209 14.7287 7.79791 14.4811 7.54198L11.2503 4.20335C10.9953 3.93985 10.5733 3.93131 10.3077 4.18427Z" fill="currentColor"/>
              </svg>
            </div>
            <span class="icon-tile-label">Arrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
