import { useState } from 'react';
import BookingDetails from '../components/BookingDetails.jsx';
import BookingFilters from '../components/BookingFilters.jsx';
import BookingForm from '../components/BookingForm.jsx';
import BookingTable from '../components/BookingTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Header from '../components/Header.jsx';
import Pagination from '../components/Pagination.jsx';
import Sidebar from '../components/Sidebar.jsx';
import useBookings from '../hooks/useBookings.js';
import {
  createBooking,
  deleteBooking,
  editBooking,
  getBooking,
  updateBookingStatus
} from '../services/bookingService.js';

const initialFilters = {
  search: '',
  status: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10
};

const statusCards = [
  { label: 'Pending', key: 'Pending', tone: 'pending', icon: '◷' },
  { label: 'Confirmed', key: 'Confirmed', tone: 'confirmed', icon: '✓' },
  { label: 'In progress', key: 'In Progress', tone: 'progress', icon: '↗' },
  { label: 'Completed', key: 'Completed', tone: 'completed', icon: '✦' }
];

export default function Dashboard() {
  const [filters, setFilters] = useState(initialFilters);
  const { bookings, pagination, summary, summaryLoaded, loading, error, refresh } = useBookings(filters);
  const [formBooking, setFormBooking] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [statusBusyId, setStatusBusyId] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  function showFeedback(type, message) {
    setFeedback({ type, message });
  }

  function openCreateForm() {
    setFormBooking(null);
    setFormOpen(true);
  }

  function openEditForm(booking) {
    setFormBooking(booking);
    setFormOpen(true);
  }

  async function saveBooking(values) {
    if (formBooking) {
      await editBooking(formBooking._id, values);
      showFeedback('success', `${formBooking.bookingId} was updated.`);
    } else {
      const result = await createBooking(values);
      showFeedback('success', `${result.data.bookingId} was created.`);
    }
    setFormOpen(false);
    refresh();
  }

  async function viewBooking(booking) {
    setDetails({ loading: true, booking: null, error: '' });
    try {
      const result = await getBooking(booking._id);
      setDetails({ loading: false, booking: result.data, error: '' });
    } catch (requestError) {
      setDetails({ loading: false, booking: null, error: requestError.message });
    }
  }

  async function changeStatus(booking, status) {
    setStatusBusyId(booking._id);
    setFeedback(null);
    try {
      await updateBookingStatus(booking._id, status);
      showFeedback('success', `${booking.bookingId} is now ${status.toLowerCase()}.`);
      refresh();
    } catch (requestError) {
      showFeedback('error', requestError.message);
    } finally {
      setStatusBusyId('');
    }
  }

  async function confirmDelete() {
    if (!confirmation) {
      return;
    }
    setDeleteBusy(true);
    try {
      const deletedId = confirmation._id;
      const result = await deleteBooking(deletedId);
      showFeedback('success', result.message);
      setConfirmation(null);
      if (bookings.length === 1 && filters.page > 1) {
        setFilters((current) => ({ ...current, page: current.page - 1 }));
      }
      refresh();
    } catch (requestError) {
      showFeedback('error', requestError.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  function chooseStatus(status) {
    setFilters((current) => ({ ...current, status, page: 1 }));
  }

  return (
    <div className="app-shell" id="dashboard">
      <Sidebar />
      <main className="main-content">
        <div className="main-inner">
          <Header onAddBooking={openCreateForm} />
          <section className="summary-section" aria-labelledby="summary-heading">
            <div className="section-heading">
              <div>
                <h2 id="summary-heading">Your bookings at a glance</h2>
                <p>A live overview of every puja booking in your workspace.</p>
              </div>
              <span className="live-indicator"><i aria-hidden="true" /> Live data</span>
            </div>
            <div className="summary-grid">
              <button
                type="button"
                className={`summary-card summary-total${filters.status === '' ? ' is-selected' : ''}`}
                onClick={() => chooseStatus('')}
                aria-pressed={filters.status === ''}
              >
                <span className="summary-card-top"><span className="summary-icon total-icon" aria-hidden="true">▤</span><span className="summary-overline">ALL TIME</span></span>
                <strong className="summary-number">{summaryLoaded ? summary.totalBookings : '—'}</strong>
                <span className="summary-label">Total bookings</span>
              </button>
              {statusCards.map((card) => (
                <button
                  type="button"
                  className={`summary-card summary-${card.tone}${filters.status === card.key ? ' is-selected' : ''}`}
                  key={card.key}
                  onClick={() => chooseStatus(filters.status === card.key ? '' : card.key)}
                  aria-pressed={filters.status === card.key}
                >
                  <span className="summary-card-top">
                    <span className={`summary-icon ${card.tone}-icon`} aria-hidden="true">{card.icon}</span>
                    <span className="summary-overline">STATUS</span>
                  </span>
                  <strong className="summary-number">{summaryLoaded ? summary.statuses[card.key] : '—'}</strong>
                  <span className="summary-label">{card.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bookings-section" aria-labelledby="bookings-heading">
            <div className="bookings-heading">
              <div>
                <div className="section-title-row">
                  <h2 id="bookings-heading">Bookings</h2>
                  <span className="record-pill">{pagination.total}</span>
                </div>
                <p>Keep track of ceremonies and devotee requests.</p>
              </div>
              <button type="button" className="button button-outline desktop-add" onClick={openCreateForm}>
                <span aria-hidden="true">＋</span> New booking
              </button>
            </div>
            <BookingFilters filters={filters} onChange={setFilters} />
            {feedback && (
              <div className={`feedback feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
                <span>{feedback.message}</span>
                <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">×</button>
              </div>
            )}
            {error && (
              <div className="feedback feedback-error" role="alert">
                <span>{error}</span>
                <button type="button" className="retry-button" onClick={refresh}>Retry</button>
              </div>
            )}
            <div className={`table-card${loading && bookings.length ? ' is-refreshing' : ''}`}>
              <BookingTable
                bookings={bookings}
                loading={loading}
                error={error}
                onView={viewBooking}
                onEdit={openEditForm}
                onDelete={setConfirmation}
                onStatusChange={changeStatus}
                updatingStatusId={statusBusyId}
              />
              <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
            </div>
            <p className="table-footnote"><span aria-hidden="true">✦</span> Dates and amounts are managed in your local timezone and Indian Rupees.</p>
          </section>
          <footer className="page-footer">Aaradhya Setu <span>·</span> Puja services workspace</footer>
        </div>
      </main>

      {formOpen && (
        <BookingForm
          booking={formBooking}
          onClose={() => setFormOpen(false)}
          onSubmit={saveBooking}
        />
      )}
      {details && (
        <BookingDetails
          booking={details.booking}
          loading={details.loading}
          error={details.error}
          onClose={() => setDetails(null)}
        />
      )}
      {confirmation && (
        <ConfirmDialog
          title="Delete booking?"
          message={`This will permanently remove ${confirmation.bookingId} for ${confirmation.devoteeName}. This action cannot be undone.`}
          confirmLabel="Delete booking"
          busy={deleteBusy}
          onCancel={() => !deleteBusy && setConfirmation(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
