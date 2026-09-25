interface Props {
  value: number | string;
}

export function Badge({ value }: Props) {
  return <span class="badge">{value}</span>;
}
