import type { ComponentChildren } from 'preact';

interface Props {
  appearance?: 'primary' | 'secondary' | 'tertiary' | 'error';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: ComponentChildren;
  type?: 'button' | 'submit';
}

export function Button({
  appearance = 'primary',
  disabled = false,
  loading = false,
  onClick,
  children,
  type = 'button',
}: Props) {
  return (
    <button
      class={`btn btn--${appearance}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading && <span class="spinner" />}
      {children}
    </button>
  );
}
