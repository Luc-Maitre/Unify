import { ComponentChildren } from 'preact';
import { IconContainer } from './IconContainer';
import { Radio } from './Radio';

interface Props {
  title: string;
  description?: string;
  icon: ComponentChildren;
  selected?: boolean;
  onClick?: () => void;
}

export function SelectionCard({ title, description, icon, selected = false, onClick }: Props) {
  return (
    <div class={`selection-card${selected ? ' selection-card--selected' : ''}`} onClick={onClick}>
      <div class="selection-card__header">
        <IconContainer size="medium">{icon}</IconContainer>
        <Radio checked={selected} />
      </div>
      <div class="selection-card__body">
        <p class="selection-card__title">{title}</p>
        {description && <p class="selection-card__description">{description}</p>}
      </div>
    </div>
  );
}
