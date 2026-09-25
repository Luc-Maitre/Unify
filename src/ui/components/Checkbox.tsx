interface Props {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

export function Checkbox({ checked = false, disabled = false, onChange, id }: Props) {
  return (
    <input
      type="checkbox"
      class="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={e => onChange?.((e.target as HTMLInputElement).checked)}
    />
  );
}
