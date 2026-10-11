const STORAGE_KEY = 'BANSAC_CART';
const EVENT_NAME = 'bansac-cart-change';

function normalize(item) {
  return Object.assign({}, item, { lineKey: item.lineKey || `${item.id}-${item.size || 'default'}-${item.color || 'default'}` });
}

export function getCart() {
  try { return (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalize); }
  catch (e) { return []; }
}

function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
  return items;
}

export function addToCart(productId, quantity, options) {
  const selected = options || {};
  const lineKey = `${productId}-${selected.size || 'default'}-${selected.color || 'default'}`;
  const items = getCart().slice();
  const existing = items.find((item) => item.lineKey === lineKey);
  const amount = quantity || 1;
  if (existing) existing.quantity += amount;
  else items.push({ id: productId, quantity: amount, size: selected.size || null, color: selected.color || null, lineKey });
  return saveCart(items);
}

export function updateCartItem(lineKey, quantity) {
  return saveCart(getCart().map((item) => item.lineKey === lineKey ? Object.assign({}, item, { quantity: Math.max(1, quantity) }) : item));
}

export function removeCartItem(lineKey) { return saveCart(getCart().filter((item) => item.lineKey !== lineKey)); }
export function clearCart() { return saveCart([]); }
export function cartCount() { return getCart().reduce((sum, item) => sum + item.quantity, 0); }
export const CART_EVENT = EVENT_NAME;
