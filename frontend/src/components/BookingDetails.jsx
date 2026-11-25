import Modal from './Modal.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export default function BookingDetails({ booking, loading, error, onClose }) {
  return (
    <Modal title="Booking details" onClose={onClose}>
      {loading ? (
        <div className="details-loading" role="status">Loading booking details…</div>
      ) : error ? (
        <div className="details-loading form-error" role="alert">{error}</div>
      ) : booking ? (
        <div className="booking-details">
          <div className="details-id">
            <div><span className="details-label">BOOKING ID</span><strong>{booking.bookingId}</strong></div>
            <StatusBadge status={booking.status} />
          </div>
          <dl className="details-list">
            <div><dt>Devotee</dt><dd>{booking.devoteeName}</dd></div>
            <div><dt>Puja</dt><dd>{booking.pujaName}</dd></div>
            <div><dt>Puja date</dt><dd>{formatDate(booking.date)}</dd></div>
            <div><dt>Amount</dt><dd>{formatCurrency(booking.amount)}</dd></div>
            <div><dt>Contact number</dt><dd>{booking.contactNumber || 'Not provided'}</dd></div>
            <div><dt>Created</dt><dd>{formatDate(booking.createdAt)}</dd></div>
            {booking.notes && <div className="details-notes"><dt>Notes</dt><dd>{booking.notes}</dd></div>}
          </dl>
        </div>
      ) : null}
      <div className="modal-actions details-actions">
        <button type="button" className="button button-light" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
