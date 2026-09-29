interface Props {
  beforeUrl?: string | null;
  afterUrl?: string | null;
}

export function PreviewPair({ beforeUrl, afterUrl }: Props) {
  return (
    <div class="preview-pair">
      <div class="preview-frame">
        <div class="preview-frame__content">
          {beforeUrl === undefined && <span class="preview-spinner" />}
          {beforeUrl && <img src={beforeUrl} alt="" />}
        </div>
        <div class="preview-frame__label">AVANT</div>
      </div>
      <svg class="preview-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3077 4.18427C10.0421 4.43722 10.0335 4.85589 10.2885 5.11939L12.436 7.33863H2.00016C1.63197 7.33863 1.3335 7.63474 1.3335 8C1.3335 8.36526 1.63197 8.66137 2.00016 8.66137H12.436L10.2885 10.8806C10.0335 11.1441 10.0421 11.5628 10.3077 11.8157C10.5733 12.0687 10.9953 12.0601 11.2503 11.7967L14.4811 8.45802C14.7287 8.20209 14.7287 7.79791 14.4811 7.54198L11.2503 4.20335C10.9953 3.93985 10.5733 3.93131 10.3077 4.18427Z" fill="currentColor"/>
      </svg>
      <div class="preview-frame">
        <div class="preview-frame__content">
          {afterUrl === undefined && <span class="preview-spinner" />}
          {afterUrl && <img src={afterUrl} alt="" />}
        </div>
        <div class="preview-frame__label">APRÈS</div>
      </div>
    </div>
  );
}
