interface Props {
  title: string;
  onBack: () => void;
}

export function ToolNavbar({ title, onBack }: Props) {
  return (
    <header class="tool-navbar">
      <button class="icon-btn" onClick={onBack} aria-label="Retour">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="tool-title">{title}</span>
    </header>
  );
}
