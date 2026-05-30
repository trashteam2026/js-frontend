import { MOCK_CATEGORIES } from '@/pages/inventory/mockData';

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
  const response = await fetch(buildUrl('/api/inventory/categories'));

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
  expirationMonth,
  expirationYear,
  quantity,
  barcode,
  categories = [],
  volunteerName = null,
  volunteerToken = null,
}) {
  const normalizedCategory = normalizeCategoryName(category);
  const matchedCategory = categories.find(
    (entry) => normalizeCategoryName(entry.name) === normalizedCategory
  );

  const payload = {
    name,
    expirationDate: toExpirationDate(expirationMonth, expirationYear),
    quantity,
    barcode: barcode || null,
    volunteerName: volunteerName || null,
  };

  if (matchedCategory?.id) {
    payload.categoryId = matchedCategory.id;
  }

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
    category,
    expirationMonth,
    expirationYear,
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
  const source = Array.isArray(categories) ? categories : MOCK_CATEGORIES;
  const seen = new Set();
  const names = [];
  for (const cat of source) {
    for (const item of cat.items) {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        names.push(item.name);
      }
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

export function getAllCategoryNames(categories = null) {
  const source = Array.isArray(categories)
    ? categories
    : MOCK_CATEGORIES.map((category) => ({ name: category.name }));

  return source
    .map((category) => category.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function findCategoryForItem(itemName, categories = null) {
  if (!itemName) return null;
  const target = itemName.trim().toLowerCase();
  const source = Array.isArray(categories) ? categories : MOCK_CATEGORIES;

  for (const cat of source) {
    if (cat.items.some((item) => item.name.toLowerCase() === target)) {
      return cat.name;
    }
  }
  return null;
}
