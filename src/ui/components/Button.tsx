import type { ComponentChildren } from 'preact';

interface Props {
  appearance?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  onClick?: () => void;
  children: ComponentChildren;
  type?: 'button' | 'submit';
}

export function Button({
  appearance = 'primary',
  disabled = false,
  onClick,
  children,
  type = 'button',
}: Props) {
  return (
    <button
      class={`btn btn--${appearance}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
