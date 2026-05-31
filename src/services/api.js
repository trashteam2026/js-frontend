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
  getAll: () => authedRequest('GET', '/items'),
  getById: (id) => authedRequest('GET', `/items/${id}`),
  create: (data) => authedRequest('POST', '/items', data),
  update: (id, data) => authedRequest('PUT', `/items/${id}`, data),
  delete: (id) => authedRequest('DELETE', `/items/${id}`),
};

export const batchesApi = {
  create: (itemId, data) =>
    authedRequest('POST', `/items/${itemId}/batches`, data),
  update: (itemId, batchId, data) =>
    authedRequest('PUT', `/items/${itemId}/batches/${batchId}`, data),
  delete: (itemId, batchId) =>
    authedRequest('DELETE', `/items/${itemId}/batches/${batchId}`),
};

export const categoriesApi = {
  getAll: () => authedRequest('GET', '/categories'),
  create: (data) => authedRequest('POST', '/categories', data),
  update: (id, data) => authedRequest('PUT', `/categories/${id}`, data),
  delete: (id) => authedRequest('DELETE', `/categories/${id}`),
};

export const activityApi = {
  getLogs: ({ start, end } = {}) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString();
    return authedRequest('GET', `/activity${qs ? `?${qs}` : ''}`);
  },
  updateLog: (id, quantity) =>
    authedRequest('PATCH', `/activity/${id}`, { quantity }),
  deleteLog: (id) => authedRequest('DELETE', `/activity/${id}`),
};

export const checkoutApi = {
  checkOut: ({ barcode, itemId, quantity }) =>
    authedRequest('POST', '/api/inventory/check-out', {
      barcode,
      itemId,
      quantity,
    }),
};

export const barcodeApi = {
  generate: ({ name, categoryId }) =>
    authedRequest('POST', '/api/barcode/generate', {
      name,
      categoryId,
    }),
};

export const volunteerApi = {
  // Owner session management
  getSession: () => authedRequest('GET', '/api/volunteer/session'),
  generateSession: () => authedRequest('POST', '/api/volunteer/session'),
  endSession: () => authedRequest('DELETE', '/api/volunteer/session'),

  // Public code verification
  verifyCode: (code) => request('POST', '/api/volunteer/verify', { code }),

  // Volunteer self-registration + profile
  register: ({ name, code }) =>
    authedRequest('POST', '/api/volunteer/register', { name, code }),
  getMyProfile: () => authedRequest('GET', '/api/volunteer/me'),

  // Owner volunteer management
  getActiveVolunteers: () => authedRequest('GET', '/api/volunteer/volunteers'),
  getVolunteerStats: () => authedRequest('GET', '/api/volunteer/stats'),
};
