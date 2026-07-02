// Guest cart — a localStorage-backed cart for logged-out visitors.
//
// The server cart (/api/cart) is protected and tied to a user, so guests can't
// use it. Instead we keep their items locally with the SAME item shape the
// server's getCart returns, so the cart UI renders identically. On login the
// guest cart is merged into the server cart (see CartContext) and cleared.

const KEY = "guest_cart";

const safeRead = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full / unavailable — ignore */
  }
};

// Items are stored without subtotal; we derive it on read so price/qty edits
// stay consistent.
const withSubtotals = (items) =>
  items.map((i) => ({ ...i, subtotal: i.price * i.quantity }));

export const guestCart = {
  read: () => withSubtotals(safeRead()),

  total: (items = safeRead()) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  count: () => safeRead().reduce((sum, i) => sum + i.quantity, 0),

  // Add (or increment) an item. `item` is a full display snapshot; quantity is
  // capped at available stock.
  add: (item, quantity = 1) => {
    const items = safeRead();
    const cap = item.stock ?? Infinity;
    const existing = items.find(
      (i) => i.variantId === item.variantId && i.productId === item.productId
    );
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, cap);
    } else {
      items.push({ ...item, quantity: Math.min(quantity, cap) });
    }
    write(items);
    return items;
  },

  setQuantity: (variantId, quantity) => {
    const items = safeRead();
    const it = items.find((i) => i.variantId === variantId);
    if (it) {
      const cap = it.stock ?? Infinity;
      it.quantity = Math.max(1, Math.min(quantity, cap));
      write(items);
    }
    return items;
  },

  remove: (variantId) => {
    const items = safeRead().filter((i) => i.variantId !== variantId);
    write(items);
    return items;
  },

  clear: () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
