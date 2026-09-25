interface Props {
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function ActionBar({
  primaryLabel,
  primaryDisabled = false,
  primaryLoading = false,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  const hasTwoButtons = Boolean(secondaryLabel);

  return (
    <div class="sticky-bar">
      {hasTwoButtons && (
        <button
          class="btn btn--secondary sticky-bar__secondary"
          onClick={onSecondary}
        >
          {secondaryLabel}
        </button>
      )}
      <button
        class="btn btn--primary sticky-bar__primary"
        disabled={primaryDisabled || primaryLoading}
        onClick={onPrimary}
      >
        {primaryLoading && <span class="spinner" />}
        {primaryLabel}
      </button>
    </div>
  );
}
