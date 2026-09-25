import type { ComponentChildren } from 'preact';

interface Props {
  size?: 'medium' | 'large';
  children: ComponentChildren;
}

export function IconContainer({ size = 'medium', children }: Props) {
  return (
    <div class={`icon-container icon-container--${size}`}>
      {children}
    </div>
  );
}
