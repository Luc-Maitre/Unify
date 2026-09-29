import type { ComponentChildren } from 'preact';
import { Checkbox } from './Checkbox';

interface Props {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  slot?: ComponentChildren;
}

export function CheckboxCard({ label, checked = false, disabled = false, onChange, slot }: Props) {
  return (
    <label class={`checkbox-card${checked ? ' checkbox-card--checked' : ''}${disabled ? ' checkbox-card--disabled' : ''}`}>
      <Checkbox checked={checked} disabled={disabled} onChange={onChange} />
      <span class="checkbox-card-label">{label}</span>
      {slot}
    </label>
  );
}
