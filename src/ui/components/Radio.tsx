interface Props {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  id?: string;
}

export function Radio({ checked = false, disabled = false, onChange, name, id }: Props) {
  return (
    <input
      type="radio"
      class="radio"
      id={id}
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={e => onChange?.((e.target as HTMLInputElement).checked)}
    />
  );
}
