import { useState, useEffect, useCallback } from 'preact/hooks';
import type { ActionBarConfig } from '../types';
import { SelectionCard } from './SelectionCard';
import fileIcon from '../assets/File.svg?raw';
import cursorIcon from '../assets/Cursor.svg?raw';
import circleCheckIcon from '../assets/CircleCheck.svg';

interface Props {
  onActionBar: (config: ActionBarConfig) => void;
  onToast: (title: string, variant: 'success' | 'error' | 'warning') => void;
  onHome: () => void;
}

type Step = 'configure' | 'success';
type Scope = 'page' | 'selection';

export function CrazyDetacherPanel({ onActionBar, onToast, onHome }: Props) {
  const [step, setStep] = useState<Step>('configure');
  const [scope, setScope] = useState<Scope>('page');
  const [detachedCount, setDetachedCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0);

  const handleReset = useCallback(() => {
    setStep('configure');
  }, []);

  const handleRun = useCallback((currentScope: Scope) => {
    onActionBar({ label: 'Détachement…', disabled: true, loading: true, onClick: () => {} });
    parent.postMessage({ pluginMessage: { type: 'crazy-detacher-run', scope: currentScope } }, '*');
  }, [onActionBar]);

  useEffect(() => {
    if (step === 'configure') {
      onActionBar({
        label: 'Détacher',
        disabled: false,
        loading: false,
        onClick: () => handleRun(scope),
      });
    }
  }, [step, scope, onActionBar, handleRun]);

  useEffect(() => {
    if (step === 'success') {
      onActionBar({
        label: 'Terminer',
        disabled: false,
        loading: false,
        onClick: onHome,
        secondaryLabel: 'Recommencer',
        onSecondary: handleReset,
      });
    }
  }, [step, onActionBar, onHome, handleReset]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === 'crazy-detacher-result') {
        const { detached, remaining } = msg as { detached: number; remaining: number };
        if (detached === 0) {
          onToast('Aucun composant à détacher', 'warning');
          onActionBar({ label: 'Détacher', disabled: false, loading: false, onClick: () => handleRun(scope) });
        } else {
          setDetachedCount(detached);
          setRemainingCount(remaining);
          setStep('success');
        }
      }

      if (msg.type === 'crazy-detacher-error') {
        onToast(msg.message ?? 'Erreur inattendue', 'error');
        onActionBar({ label: 'Détacher', disabled: false, loading: false, onClick: () => handleRun(scope) });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onActionBar, onToast, handleRun, scope]);

  if (step === 'success') {
    return (
      <div class="success-panel">
        <img class="success-icon" src={circleCheckIcon} width="120" height="120" alt="" />
        <h2 class="success-title">{detachedCount} composant{detachedCount > 1 ? 's' : ''} détaché{detachedCount > 1 ? 's' : ''}</h2>
        <p class="success-desc">Le plan s'est passé sans encombres</p>
      </div>
    );
  }

  return (
    <div class="crazy-detacher-panel">
      <div class="tool-description">
        <p>Détache tous les composants qui ne proviennent pas des librairies <strong>Spark Design System</strong> ou <strong>LBC Iconography.</strong></p>
        <p>Les instances imbriquées dans d'autres instances sont traitées automatiquement en cascade.</p>
      </div>
      <div class="scope-row">
        <SelectionCard
          title="Toute la page"
          icon={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: fileIcon }} />}
          selected={scope === 'page'}
          onClick={() => setScope('page')}
        />
        <SelectionCard
          title="Sélection"
          icon={<span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: cursorIcon }} />}
          selected={scope === 'selection'}
          onClick={() => setScope('selection')}
        />
      </div>
    </div>
  );
}
