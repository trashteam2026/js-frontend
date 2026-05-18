import { auth } from '@/firebase-config';

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

// Attaches the current Firebase ID token. Throws an error with .status,
// .code, and .body fields so callers can branch on backend error codes
// (BARCODE_NOT_FOUND, INSUFFICIENT_STOCK, etc.).
async function authedRequest(method, path, body) {
  const user = auth.currentUser;
  if (!user) {
    const e = new Error('Not authenticated');
    e.status = 401;
    throw e;
  }
  const idToken = await user.getIdToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const e = new Error(data.error || `HTTP ${res.status}`);
    e.status = res.status;
    e.code = data.code;
    e.body = data;
    throw e;
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
  update: (id, data) => request('PUT', `/categories/${id}`, data),
  delete: (id) => request('DELETE', `/categories/${id}`),
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

export const checkoutApi = {
  checkOut: ({ barcode, itemId, quantity }) =>
    authedRequest('POST', '/api/inventory/check-out', {
      barcode,
      itemId,
      quantity,
    }),
};
