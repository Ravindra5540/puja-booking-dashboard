import { useCallback, useEffect, useState } from 'react';
import { listBookings } from '../services/bookingService.js';

export default function useBookings(filters) {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState({
    totalBookings: 0,
    statuses: { Pending: 0, Confirmed: 0, 'In Progress': 0, Completed: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [error, setError] = useState('');
  const [requestNumber, setRequestNumber] = useState(0);

  const refresh = useCallback(() => setRequestNumber((number) => number + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    listBookings(filters, { signal: controller.signal })
      .then((result) => {
        setBookings(result.data);
        setPagination(result.pagination);
        setSummary(result.summary);
        setSummaryLoaded(true);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters, requestNumber]);

  return { bookings, pagination, summary, summaryLoaded, loading, error, refresh };
}
