import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, message, confirmLabel, busy, onCancel, onConfirm }) {
  return (
    <Modal title={title} onClose={onCancel} size="modal-compact">
      <div className="confirm-content">
        <div className="confirm-icon" aria-hidden="true">!</div>
        <p>{message}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="button button-light" onClick={onCancel}>Keep booking</button>
        <button type="button" className="button button-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
