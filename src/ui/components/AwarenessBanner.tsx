import type { ComponentChildren } from 'preact';
import { IconContainer } from './IconContainer';

interface Props {
  title: string;
  description: string;
  icon: ComponentChildren;
}

export function AwarenessBanner({ title, description, icon }: Props) {
  return (
    <div class="awareness-card">
      <IconContainer size="large">{icon}</IconContainer>
      <div class="awareness-content">
        <span class="awareness-title">{title}</span>
        <span class="awareness-body">{description}</span>
      </div>
    </div>
  );
}
