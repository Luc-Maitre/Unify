interface Props {
  value: number;
}

export function Stepper({ value }: Props) {
  return <span class="stepper">{value}</span>;
}
