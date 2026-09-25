interface Props {
  variant: 'success' | 'error' | 'warning';
  title: string;
  description?: string;
}

const ICONS = {
  success: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2"/>
      <path d="M10 16.5L14 20.5L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2"/>
      <path d="M11.5 11.5L20.5 20.5M20.5 11.5L11.5 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L29 27H3L16 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 13V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="16" cy="23" r="1.25" fill="currentColor"/>
    </svg>
  ),
};

export function Feedback({ variant, title, description }: Props) {
  return (
    <div class={`feedback feedback--${variant}`}>
      <span class="feedback__icon">{ICONS[variant]}</span>
      <div class="feedback__content">
        <span class="feedback__title">{title}</span>
        {description && <span class="feedback__desc">{description}</span>}
      </div>
    </div>
  );
}
