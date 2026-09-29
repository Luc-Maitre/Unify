export interface MigrationMeta {
  id: string;
  label: string;
  disabled: boolean;
}

export interface InstanceInfo {
  id: string;
  name: string;
  pageName: string;
  parentName: string;
  properties: Record<string, string>;
  targetComponentKey: string;
  mappedProperties: Record<string, string>;
}

export type Panel = 'home' | 'transition' | 'uikit' | 'achievements';

export interface AchievementInfo {
  id: string;
  label: string;
  subtitle: string;
  unlockedAt?: string;
}

export interface ActionBarConfig {
  label: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}
