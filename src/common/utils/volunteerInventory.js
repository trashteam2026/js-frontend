import { auth } from '@/firebase-config';

const STORAGE_KEY = 'pantry_volunteer_added_items';

const buildUrl = (endpoint) =>
  `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${endpoint}`;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeCategoryName(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

function toExpirationDate(expirationMonth, expirationYear) {
  const month = String(expirationMonth).padStart(2, '0');
  return `${expirationYear}-${month}-01`;
}

export function getAddedItems() {
  return readAll();
}

export async function fetchCategories() {
  // GET /api/inventory/categories now requires a valid Firebase token. The
  // signed-in anonymous volunteer's token is attached the same way addItem's
  // caller does (auth.currentUser.getIdToken()) so scan-in can still load
  // categories.
  const token = await auth.currentUser?.getIdToken().catch(() => null);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(buildUrl('/api/inventory/categories'), {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to load categories');
  }

  return response.json();
}

export async function lookupByBarcode(barcode) {
  const response = await fetch(buildUrl('/api/barcode/lookup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode }),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to look up barcode');
  }

  return response.json();
}

export async function addItem({
  name,
  category,
  categoryId,
  expirationMonth,
  expirationYear,
  noExpiration = false,
  quantity,
  barcode,
  categories = [],
  volunteerName = null,
  volunteerToken = null,
}) {
  const normalizedCategory = normalizeCategoryName(category);
  const normalizedCategoryId =
    categoryId === undefined || categoryId === null || categoryId === ''
      ? null
      : Number.parseInt(categoryId, 10);
  const matchedCategory = normalizedCategoryId
    ? categories.find((entry) => Number(entry.id) === normalizedCategoryId)
    : categories.find(
        (entry) => normalizeCategoryName(entry.name) === normalizedCategory
      );

  // The volunteer form only exposes existing categories. Keep this safety net
  // so a stale or tampered selection never becomes an uncategorized item.
  if (!matchedCategory) {
    const err = new Error('Please pick an existing category');
    err.code = 'CATEGORY_NOT_FOUND';
    throw err;
  }

  const payload = {
    name,
    expirationDate: noExpiration
      ? null
      : toExpirationDate(expirationMonth, expirationYear),
    quantity,
    barcode: barcode || null,
    volunteerName: volunteerName || null,
    categoryId: matchedCategory.id,
  };

  const headers = { 'Content-Type': 'application/json' };
  if (volunteerToken) headers['Authorization'] = `Bearer ${volunteerToken}`;

  const response = await fetch(buildUrl('/api/inventory/check-in'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const err = new Error(data?.error || 'Failed to save item');
    err.status = response.status;
    err.code = data?.code;
    throw err;
  }

  const saved = await response.json();

  const localRecord = {
    name,
    category: matchedCategory.name,
    categoryId: matchedCategory.id,
    expirationMonth,
    expirationYear,
    noExpiration,
    quantity,
    barcode: barcode || null,
    timestamp: new Date().toISOString(),
  };
  const all = readAll();
  all.push(localRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  return saved;
}

export function getAllItemNames(categories = null) {
  // No mock fallback: if categories failed to load (non-array), surface nothing
  // so the calling UI shows its empty/error state rather than fake inventory.
  if (!Array.isArray(categories)) return [];
  const seen = new Set();
  const names = [];
  for (const cat of categories) {
    for (const item of cat.items || []) {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        names.push(item.name);
      }
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

export function getAllCategoryNames(categories = null) {
  if (!Array.isArray(categories)) return [];
  return categories
    .map((category) => category.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function findCategoryForItem(itemName, categories = null) {
  if (!itemName || !Array.isArray(categories)) return null;
  const target = itemName.trim().toLowerCase();

  for (const cat of categories) {
    if ((cat.items || []).some((item) => item.name.toLowerCase() === target)) {
      return cat.name;
    }
  }
  return null;
}
