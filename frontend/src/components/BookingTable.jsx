import { formatCurrency, formatDate } from '../utils/formatters.js';
const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function BookingTable({
  bookings,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  updatingStatusId
}) {
  return (
    <div className="table-scroll">
      <table className="booking-table">
        <thead>
          <tr>
            <th scope="col">Booking ID</th>
            <th scope="col">Devotee</th>
            <th scope="col">Puja</th>
            <th scope="col">Date</th>
            <th scope="col" className="amount-column">Amount</th>
            <th scope="col">Status</th>
            <th scope="col" className="actions-heading">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && bookings.length === 0 ? (
            <tr><td className="table-message" colSpan="7"><span className="spinner" /> Loading bookings…</td></tr>
          ) : error && bookings.length === 0 ? (
            <tr>
              <td className="table-message empty-message" colSpan="7">
                <span className="empty-icon" aria-hidden="true">!</span>
                <strong>Bookings are unavailable</strong>
                <span>Reconnect to the booking service and retry.</span>
              </td>
            </tr>
          ) : bookings.length === 0 ? (
            <tr>
              <td className="table-message empty-message" colSpan="7">
                <span className="empty-icon" aria-hidden="true">◷</span>
                <strong>No bookings found</strong>
                <span>Try adjusting your search or filters, or add a new booking.</span>
              </td>
            </tr>
          ) : bookings.map((booking) => (
            <tr key={booking._id}>
              <td><span className="booking-id">{booking.bookingId}</span></td>
              <td>
                <div className="devotee-cell">
                  <span className="devotee-avatar" aria-hidden="true">{initials(booking.devoteeName)}</span>
                  <span className="devotee-name">{booking.devoteeName}</span>
                </div>
              </td>
              <td className="puja-cell">{booking.pujaName}</td>
              <td className="date-cell">{formatDate(booking.date)}</td>
              <td className="amount-cell">{formatCurrency(booking.amount)}</td>
              <td>
                <label className="status-select-label">
                  <span className="visually-hidden">Update status for {booking.bookingId}</span>
                  <select
                    className="status-select"
                    value={booking.status}
                    onChange={(event) => onStatusChange(booking, event.target.value)}
                    disabled={updatingStatusId === booking._id}
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </td>
              <td>
                <div className="row-actions">
                  <button type="button" className="icon-button" onClick={() => onView(booking)} aria-label={`View ${booking.bookingId}`} title="View details">↗</button>
                  <button type="button" className="icon-button" onClick={() => onEdit(booking)} aria-label={`Edit ${booking.bookingId}`} title="Edit booking">✎</button>
                  <button type="button" className="icon-button delete-action" onClick={() => onDelete(booking)} aria-label={`Delete ${booking.bookingId}`} title="Delete booking">⌫</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
