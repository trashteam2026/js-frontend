const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const itemsApi = {
  getAll: () => request('GET', '/items'),
  getById: (id) => request('GET', `/items/${id}`),
  create: (data) => request('POST', '/items', data),
  update: (id, data) => request('PUT', `/items/${id}`, data),
  delete: (id) => request('DELETE', `/items/${id}`),
};

export const batchesApi = {
  create: (itemId, data) => request('POST', `/items/${itemId}/batches`, data),
  update: (itemId, batchId, data) =>
    request('PUT', `/items/${itemId}/batches/${batchId}`, data),
  delete: (itemId, batchId) =>
    request('DELETE', `/items/${itemId}/batches/${batchId}`),
};

export const categoriesApi = {
  getAll: () => request('GET', '/categories'),
  create: (data) => request('POST', '/categories', data),
};

export const activityApi = {
  getLogs: ({ start, end } = {}) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString();
    return request('GET', `/activity${qs ? `?${qs}` : ''}`);
  },
};
