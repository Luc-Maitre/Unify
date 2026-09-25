interface Props {
  variant?: 'default' | 'new' | 'tertiary';
  children: string;
}

export function Tag({ variant = 'default', children }: Props) {
  return <span class={`tag tag--${variant}`}>{children}</span>;
}
