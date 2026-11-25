export default function Pagination({ pagination, onPageChange }) {
  const { page, limit, total, totalPages } = pagination;
  const firstRecord = total ? (page - 1) * limit + 1 : 0;
  const lastRecord = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <p>
        Showing <strong>{firstRecord}–{lastRecord}</strong> of <strong>{total}</strong> bookings
      </p>
      <div className="pagination-actions">
        <button
          className="button button-light page-button"
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ← <span>Previous</span>
        </button>
        <span className="page-count">Page {page} of {Math.max(totalPages, 1)}</span>
        <button
          className="button button-light page-button"
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span>Next</span> →
        </button>
      </div>
    </div>
  );
}
