import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import type { Panel, ActionBarConfig } from './types';
import { HomePanel } from './components/HomePanel';
import { TransitionPanel } from './components/TransitionPanel';
import { UiKitPanel } from './components/UiKitPanel';
import { ToolNavbar } from './components/ToolNavbar';
import { Footer } from './components/Footer';
import { ActionBarLegacy } from './components/ActionBarLegacy';
import { Feedback } from './components/Feedback';
import { LogoMotion } from './components/LogoMotion';

interface ToastState {
  title: string;
  variant: 'success' | 'error' | 'warning';
}

export function App() {
  const [panel, setPanel] = useState<Panel>('home');
  const [panelTitle, setPanelTitle] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [actionBar, setActionBar] = useState<ActionBarConfig | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [splashFading, setSplashFading] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const removeTimer = setTimeout(() => setSplashGone(true), 2400);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  const showToast = useCallback((title: string, variant: 'success' | 'error' | 'warning') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ title, variant });
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
      {!splashGone && (
        <div class={`splash-overlay${splashFading ? ' splash-overlay--fade' : ''}`}>
          <LogoMotion width={56} height={56} />
        </div>
      )}
      {!isHome && <ToolNavbar title={panelTitle} onBack={navigateHome} />}
      <div class="main">
        {panel === 'home' && <HomePanel onNavigate={navigateTo} />}
        {panel === 'transition' && (
          <TransitionPanel onActionBar={setActionBar} onToast={showToast} />
        )}
        {panel === 'uikit' && <UiKitPanel />}
      </div>
      {!isHome && actionBar && (
        <ActionBarLegacy
          label={actionBar.label}
          disabled={actionBar.disabled}
          loading={actionBar.loading}
          onClick={actionBar.onClick}
        />

      )}
      <Footer onUiKit={() => navigateTo('uikit', 'UI Kit')} />
      {toast && (
        <div class="toast visible">
          <Feedback variant={toast.variant} title={toast.title} />
        </div>
      )}
    </>
  );
}
