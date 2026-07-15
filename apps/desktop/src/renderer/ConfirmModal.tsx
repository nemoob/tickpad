type ConfirmModalProps = {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ cancelLabel, confirmLabel, description, title, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <div
      className="settings-modal-backdrop confirm-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="confirm-modal-copy">
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-button" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="confirm-modal-button primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
