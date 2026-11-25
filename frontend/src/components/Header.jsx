export default function Header({ onAddBooking }) {
  return (
    <header className="page-header">
      <div>
        <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>Overview</strong></div>
        <h1>Puja Booking Dashboard</h1>
        <p>Manage your devotees and upcoming ceremonies.</p>
      </div>
      <button className="button button-primary header-add" onClick={onAddBooking} type="button" aria-label="Add booking">
        <span aria-hidden="true">＋</span> Add booking
      </button>
    </header>
  );
}
