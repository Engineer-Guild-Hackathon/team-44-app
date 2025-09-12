import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-modal-overlay)] bg-opacity-40">
      <div className="bg-[var(--color-bg-light)] text-[var(--color-text-light)] rounded-lg shadow-lg p-6 w-full max-w-xs border border-[var(--color-primary)]" style={{ background: 'var(--color-bg-light)', color: 'var(--color-text-light)' }}>
        {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        <p className="mb-4 text-sm">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded bg-[var(--color-muted)] text-[var(--color-text-light)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            className="px-4 py-2 rounded bg-[var(--color-error)] text-[var(--color-text-dark)] hover:bg-[var(--color-error)]/80"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
