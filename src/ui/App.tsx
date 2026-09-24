import { useState, useRef, useCallback } from 'preact/hooks';
import type { Panel, ActionBarConfig } from './types';
import { HomePanel } from './components/HomePanel';
import { TransitionPanel } from './components/TransitionPanel';
import { UiKitPanel } from './components/UiKitPanel';
import { ToolNavbar } from './components/ToolNavbar';
import { Footer } from './components/Footer';
import { ActionBar } from './components/ActionBar';

interface ToastState {
  msg: string;
  type: 'success' | 'error';
}

export function App() {
  const [panel, setPanel] = useState<Panel>('home');
  const [panelTitle, setPanelTitle] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [actionBar, setActionBar] = useState<ActionBarConfig | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  function navigateTo(panelId: string, title: string) {
    setPanel(panelId as Panel);
    setPanelTitle(title);
    setActionBar(null);
  }

  function navigateHome() {
    setPanel('home');
    setPanelTitle('');
    setActionBar(null);
  }

  const isHome = panel === 'home';

  return (
    <>
      {!isHome && <ToolNavbar title={panelTitle} onBack={navigateHome} />}
      <div class="main">
        {panel === 'home' && <HomePanel onNavigate={navigateTo} />}
        {panel === 'transition' && (
          <TransitionPanel onActionBar={setActionBar} onToast={showToast} />
        )}
        {panel === 'uikit' && <UiKitPanel />}
      </div>
      {!isHome && actionBar && (
        <ActionBar
          label={actionBar.label}
          disabled={actionBar.disabled}
          loading={actionBar.loading}
          onClick={actionBar.onClick}
        />
      )}
      <Footer onSettings={() => navigateTo('uikit', 'UI Kit')} />
      {toast && <div class={`toast ${toast.type} visible`}>{toast.msg}</div>}
    </>
  );
}
