interface Props {
  title: string;
  onBack: () => void;
}

export function ToolNavbar({ title, onBack }: Props) {
  return (
    <header class="tool-navbar">
      <button class="icon-btn" onClick={onBack} aria-label="Retour">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M11.1356 1.51899C11.3916 1.77398 11.3999 2.196 11.1542 2.46161L6.03013 7.99992L11.1542 13.5382C11.3999 13.8038 11.3916 14.2259 11.1356 14.4808C10.8796 14.7358 10.4729 14.7272 10.2272 14.4616L4.98035 8.79056C4.8809 8.68726 4.80282 8.56506 4.74944 8.43179C4.6945 8.29462 4.6665 8.14772 4.6665 7.99992C4.6665 7.85212 4.6945 7.70522 4.74944 7.56805C4.80282 7.43478 4.8809 7.31257 4.98035 7.20928L10.2272 1.53823C10.4729 1.27262 10.8796 1.26401 11.1356 1.51899Z" fill="currentColor"/>
        </svg>
      </button>
      <span class="tool-title">{title}</span>
    </header>
  );
}
