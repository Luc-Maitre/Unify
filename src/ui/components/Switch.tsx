interface Props {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
  name?: string;
}

export function Switch({ checked = false, disabled = false, onChange, id, name }: Props) {
  return (
    <input
      type="checkbox"
      class="toggle"
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={e => onChange?.((e.target as HTMLInputElement).checked)}
    />
  );
}
