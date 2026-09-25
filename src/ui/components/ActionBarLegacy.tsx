// @deprecated — à migrer vers ActionBar lors de la refonte de TransitionPanel

interface Props {
  label: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function ActionBarLegacy({ label, disabled, loading, onClick }: Props) {
  return (
    <div class="action-bar">
      <button class="btn-action" disabled={disabled || loading} onClick={onClick}>
        {loading && <span class="spinner" />}
        {label}
      </button>
    </div>
  );
}
