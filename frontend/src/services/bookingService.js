const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error('Unable to reach the booking service. Check the API connection and try again.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`The booking service returned HTTP ${response.status}. Check the backend connection and try again.`);
  }
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'The booking request could not be completed.');
  }
  return result;
}

export async function listBookings(filters, { signal } = {}) {
  const parameters = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      parameters.set(key, String(value));
    }
  });
  const query = parameters.toString();
  return request(`/bookings${query ? `?${query}` : ''}`, { signal });
}

export async function getBooking(id) {
  return request(`/bookings/${encodeURIComponent(id)}`);
}

export async function createBooking(booking) {
  return request('/bookings', { method: 'POST', body: JSON.stringify(booking) });
}

export async function editBooking(id, updates) {
  return request(`/bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

export async function updateBookingStatus(id, status) {
  return request(`/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function deleteBooking(id) {
  return request(`/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
