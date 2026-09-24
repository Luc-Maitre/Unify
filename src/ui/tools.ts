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
    categories: ['quotidien'],
    status: 'active',
    category: 'QUOTIDIEN',
    iconPaths: '<path d="M5 3.5L3 1.5L1 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 1.5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 12.5L13 14.5L15 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 14.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    id: 'fast-updates',
    title: 'Fast&Furious Updates',
    desc: 'Mettez à jour vos librairies directement depuis le plugin, sans quitter Figma.',
    categories: ['quotidien'],
    status: 'new',
    category: 'QUOTIDIEN',
    iconPaths: '<path d="M2 14L9 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 1L11.6 2.8L13.5 3L11.6 3.7L11 5.5L10.4 3.7L8.5 3L10.4 2.8L11 1Z" fill="currentColor"/><path d="M4 1.5L4.4 2.5L5.5 3L4.4 3.5L4 4.5L3.6 3.5L2.5 3L3.6 2.5L4 1.5Z" fill="currentColor"/>',
  },
  {
    id: 'outil-3',
    title: 'Outil n°3',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    categories: ['review'],
    status: 'new',
    category: 'REVIEW',
    iconPaths: '<path d="M8 1L9.5 5.5H14L10.25 8.25L11.75 12.75L8 10L4.25 12.75L5.75 8.25L2 5.5H6.5L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  },
  {
    id: 'locked',
    title: 'Title',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    categories: [],
    status: 'disabled',
    category: 'CATÉGORIE',
    iconPaths: '<rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 7V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
];
