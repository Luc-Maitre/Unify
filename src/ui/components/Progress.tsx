interface Props {
  label?: string;
  showLabel?: boolean;
  current: number;
  total: number;
  className?: string;
}

export function Progress({ label, showLabel = true, current, total, className }: Props) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div class={`progress${className ? ` ${className}` : ''}`}>
      {showLabel && (
        <div class="progress__label-row">
          <span class="progress__label">{label}</span>
          <div class="progress__tracker">
            <span class="progress__current">{current}</span>
            <span class="progress__sep">/</span>
            <span class="progress__total">{total}</span>
          </div>
        </div>
      )}
      <div class="progress__bar">
        <div class="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
