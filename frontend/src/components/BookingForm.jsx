import { useState } from 'react';
import Modal from './Modal.jsx';
import { toDateInputValue } from '../utils/formatters.js';

function getInitialValues(booking) {
  if (!booking) {
    return { devoteeName: '', pujaName: '', date: '', amount: '', contactNumber: '', notes: '' };
  }
  return {
    devoteeName: booking.devoteeName,
    pujaName: booking.pujaName,
    date: toDateInputValue(booking.date),
    amount: String(booking.amount),
    contactNumber: booking.contactNumber || '',
    notes: booking.notes || ''
  };
}

export default function BookingForm({ booking, onClose, onSubmit }) {
  const [values, setValues] = useState(() => getInitialValues(booking));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const editing = Boolean(booking);

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        amount: Number(values.amount),
        date: new Date(`${values.date}T12:00:00`).toISOString()
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit booking' : 'Add a booking'} onClose={onClose} size="modal-large">
      <form className="booking-form" onSubmit={submit}>
        <p className="form-intro">
          {editing ? `Update the details for ${booking.bookingId}.` : 'Add a new puja booking to your workspace.'}
        </p>
        <div className="form-grid">
          <label className="form-field">
            <span>Devotee name <span className="required-mark">*</span></span>
            <input name="devoteeName" value={values.devoteeName} onChange={change} minLength="2" maxLength="100" required autoComplete="name" />
          </label>
          <label className="form-field">
            <span>Puja name <span className="required-mark">*</span></span>
            <input name="pujaName" value={values.pujaName} onChange={change} minLength="2" maxLength="120" required />
          </label>
          <label className="form-field">
            <span>Puja date <span className="required-mark">*</span></span>
            <input name="date" type="date" value={values.date} onChange={change} required />
          </label>
          <label className="form-field">
            <span>Amount (INR) <span className="required-mark">*</span></span>
            <div className="amount-input">
              <span aria-hidden="true">₹</span>
              <input name="amount" type="number" value={values.amount} onChange={change} min="0" step="0.01" required />
            </div>
          </label>
          <label className="form-field form-field-full">
            <span>Contact number <span className="optional-label">Optional</span></span>
            <input
              name="contactNumber"
              type="tel"
              value={values.contactNumber}
              onChange={change}
              maxLength="20"
              pattern="\+?[0-9\s()-]{7,20}"
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </label>
          <label className="form-field form-field-full">
            <span>Notes <span className="optional-label">Optional</span></span>
            <textarea name="notes" value={values.notes} onChange={change} maxLength="1000" rows="3" placeholder="Add a note for the team" />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button button-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
