import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import type { Panel, ActionBarConfig, AchievementInfo, Theme } from './types';
import { HomePanel } from './components/HomePanel';
import { TransitionPanel } from './components/TransitionPanel';
import { UiKitPanel } from './components/UiKitPanel';
import { AchievementsPanel } from './components/AchievementsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ToolNavbar } from './components/ToolNavbar';
import { Footer } from './components/Footer';
import { ActionBar } from './components/ActionBar';
import { Feedback } from './components/Feedback';
import { AchievementToast } from './components/AchievementToast';
import { LogoMotion } from './components/LogoMotion';

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  if (theme !== 'auto') document.documentElement.classList.add(theme);
}

interface ToastState {
  title: string;
  variant: 'success' | 'error' | 'warning';
}

export function App() {
  const [panel, setPanel] = useState<Panel>('home');
  const [panelTitle, setPanelTitle] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [actionBar, setActionBar] = useState<ActionBarConfig | null>(null);
  const [achievement, setAchievement] = useState<{ id: string; label: string; subtitle: string } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementInfo[]>([]);
  const [totalOpens, setTotalOpens] = useState(0);
  const [theme, setTheme] = useState<Theme>('auto');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [splashFading, setSplashFading] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  const showToast = useCallback((title: string, variant: 'success' | 'error' | 'warning') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ title, variant });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const showAchievementToast = useCallback((a: { id: string; label: string; subtitle: string }) => {
    if (achievementTimer.current) clearTimeout(achievementTimer.current);
    setAchievement(a);
    achievementTimer.current = setTimeout(() => setAchievement(null), 4000);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2000);
    const removeTimer = setTimeout(() => setSplashGone(true), 2400);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data?.pluginMessage;
      if (msg?.type === 'stats') {
        setUnlockedAchievements(msg.unlockedAchievements ?? []);
        setTotalOpens(msg.totalOpens ?? 0);
      }
      if (msg?.type === 'theme') {
        const t = (msg.theme ?? 'auto') as Theme;
        setTheme(t);
        applyTheme(t);
      }
      if (msg?.type === 'achievement-unlocked') {
        setUnlockedAchievements(prev => {
          if (prev.some(a => a.id === msg.id)) return prev;
          return [...prev, { id: msg.id, label: msg.label, subtitle: msg.subtitle, unlockedAt: msg.unlockedAt }];
        });
        achievementTimer.current = setTimeout(() => {
          showAchievementToast({ id: msg.id, label: msg.label, subtitle: msg.subtitle });
        }, 3000);
      }
    }
    window.addEventListener('message', handleMessage);
    parent.postMessage({ pluginMessage: { type: 'get-stats' } }, '*');
    parent.postMessage({ pluginMessage: { type: 'get-theme' } }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, [showAchievementToast]);

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

  function handleThemeChange(t: Theme) {
    setTheme(t);
    applyTheme(t);
    parent.postMessage({ pluginMessage: { type: 'set-theme', theme: t } }, '*');
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
          <TransitionPanel onActionBar={setActionBar} onToast={showToast} onHome={navigateHome} />
        )}
        {panel === 'uikit' && (
          <UiKitPanel
            totalOpens={totalOpens}
            onTriggerAchievement={showAchievementToast}
          />
        )}
        {panel === 'achievements' && <AchievementsPanel achievements={unlockedAchievements} />}
        {panel === 'settings' && <SettingsPanel theme={theme} onThemeChange={handleThemeChange} />}
      </div>
      {!isHome && actionBar && (
        <ActionBar
          primaryLabel={actionBar.label}
          primaryDisabled={actionBar.disabled}
          primaryLoading={actionBar.loading}
          onPrimary={actionBar.onClick}
          secondaryLabel={actionBar.secondaryLabel}
          onSecondary={actionBar.onSecondary}
        />
      )}
      <Footer
        onUiKit={() => navigateTo('uikit', 'UI Kit')}
        hasAchievements={unlockedAchievements.length > 0}
        onAchievements={() => navigateTo('achievements', 'Mes succès')}
        onSettings={() => navigateTo('settings', 'Paramètres')}
      />
      {toast && (
        <div class="toast visible">
          <Feedback variant={toast.variant} title={toast.title} />
        </div>
      )}
      {achievement && (
        <div
          class="toast visible achievement-toast-wrap"
          style={{ bottom: (!isHome && actionBar) ? '160px' : '68px' }}
        >
          <AchievementToast id={achievement.id} label={achievement.label} subtitle={achievement.subtitle} onClose={() => setAchievement(null)} />
        </div>
      )}
    </>
  );
}
