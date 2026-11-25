const statusClassNames = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  'In Progress': 'status-progress',
  Completed: 'status-completed'
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusClassNames[status] || ''}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}
