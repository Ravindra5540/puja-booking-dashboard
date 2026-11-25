const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed'];
const sortFields = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'devoteeName', label: 'Devotee name' }
];

export default function BookingFilters({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <section className="filter-bar" aria-label="Filter bookings">
      <label className="search-field">
        <span className="visually-hidden">Search bookings</span>
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Search by devotee, puja or ID"
        />
        {filters.search && (
          <button
            type="button"
            className="search-clear"
            onClick={() => update('search', '')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </label>
      <div className="filter-controls">
        <label className="select-control">
          <span className="visually-hidden">Filter by status</span>
          <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="select-control sort-control">
          <span className="visually-hidden">Sort bookings by</span>
          <select value={filters.sortBy} onChange={(event) => update('sortBy', event.target.value)}>
            {sortFields.map((field) => <option key={field.value} value={field.value}>Sort: {field.label}</option>)}
          </select>
        </label>
        <button
          type="button"
          className="button button-light direction-button"
          onClick={() => update('order', filters.order === 'asc' ? 'desc' : 'asc')}
          aria-label={`Sort ${filters.order === 'asc' ? 'descending' : 'ascending'}`}
          title={`Currently ${filters.order === 'asc' ? 'ascending' : 'descending'}`}
        >
          <span aria-hidden="true">{filters.order === 'asc' ? '↑' : '↓'}</span>
        </button>
      </div>
    </section>
  );
}
