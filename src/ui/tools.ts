export interface Tool {
  id: string;
  panelId?: string;
  title: string;
  desc: string;
  categories: string[];
  status: 'active' | 'new' | 'disabled';
  category: string;
  iconPaths: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'transition',
    panelId: 'transition',
    title: 'Easy Swap',
    desc: "Remplacez vos composants lors d'un rebranding ou d'une mise à jour de librairie.",
    categories: ['rebranding'],
    status: 'active',
    category: 'REBRANDING',
    iconPaths: '<path d="M5 3.5L3 1.5L1 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 1.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 12.5L13 14.5L15 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 14.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  }
];
