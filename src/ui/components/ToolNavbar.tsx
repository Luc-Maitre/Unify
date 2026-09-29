import chevronLeft from '../assets/ChevronLeft.svg';

interface Props {
  title: string;
  onBack: () => void;
}

export function ToolNavbar({ title, onBack }: Props) {
  return (
    <header class="tool-navbar">
      <button class="icon-btn" onClick={onBack} aria-label="Retour">
        <img src={chevronLeft} width="24" height="24" alt="" />
      </button>
      <span class="tool-title">{title}</span>
    </header>
  );
}
