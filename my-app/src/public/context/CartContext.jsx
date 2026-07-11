import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cartService } from "../../Shared/services/cartService";
import { toastService } from "../../Shared/services/toastService";
import { guestCart } from "../../Shared/utils/guestCart";
import { salePrice } from "../../Shared/utils/pricing";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../Shared/AuthContext";

const CartContext = createContext();

const EMPTY_CART = { items: [], bundles: [], total: 0 };

// Safely pull a human-readable message out of an API error, which may be a
// plain string (`{ error: "..." }`) or a structured object
// (`{ error: { message, code } }`). Never returns a raw object.
const apiMessage = (err, fallback) => {
  const e = err?.response?.data?.error;
  if (typeof e === "string") return e;
  if (e && typeof e.message === "string") return e.message;
  return fallback;
};

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { t } = useTranslation();

  const [cart, setCart] = useState(EMPTY_CART);

  // Snapshot of the most recently added item, used to drive the small
  // "Added to cart" info popover near the cart icon. `nonce` makes every add
  // a distinct value so the popover re-shows even if the same item is added
  // twice in a row.
  const [addedItem, setAddedItem] = useState(null);
  const clearAddedItem = () => setAddedItem(null);

  const isLoggedIn = !!user?._id;

  // Identifies the session a fetch belongs to. If the user changes (login /
  // logout) while a fetch is in flight, the stale response is ignored — this is
  // what prevents a logged-out guest from ever seeing a previous user's cart.
  const sessionRef = useRef(null);

  // --- Guest (local) cart -------------------------------------------------
  // Bundle offers are a logged-in-only purchase (the sign-in gate is at add
  // time, unlike single products), so a guest cart never has bundles.
  const loadGuestCart = () => {
    const items = guestCart.read();
    setCart({ items, bundles: [], total: guestCart.total(items) });
  };

  // --- Server cart --------------------------------------------------------
  const fetchCart = async () => {
    const owner = user?._id || null;
    sessionRef.current = owner;
    try {
      const { data } = await cartService.getCart();
      // Drop the result if the session changed while we were fetching.
      if (sessionRef.current !== owner) return;
      setCart({
        items: data.items || [],
        bundles: data.bundles || [],
        total: data.total || 0,
      });
    } catch (err) {
      if (sessionRef.current !== owner) return;
      setCart(EMPTY_CART);
      // A 401 just means "no session" (handled by the api interceptor) — don't
      // surface it as a cart error. Only report genuine load failures.
      if (err.response?.status !== 401) {
        console.log(err);
        toastService.error(t("cart.load_failed"));
      }
    }
  };

  const addToCart = async (payload) => {
    const { productId, variantId, quantity = 1, product, variant } = payload;

    // Display snapshot for the "added to cart" popover. Only buildable when
    // the caller passed the full product/variant (AddToCartSection always
    // does); falls back to a plain toast otherwise.
    const buildSnapshot = () =>
      product && variant
        ? {
            productId,
            variantId,
            quantity,
            name: product.name,
            translations: product.translations,
            color: variant.color,
            storage: variant.storage,
            variantTranslations: variant.translations,
            image: variant.images?.[0] || product.image || null,
            price: variant.price,
            nonce: Date.now(),
          }
        : null;

    // Guest: keep the item locally so they can build a cart without an account.
    // The login gate happens at checkout, not here.
    if (!isLoggedIn) {
      if (!product || !variant) {
        toastService.error(t("cart.add_failed"));
        return;
      }
      if (variant.stock === 0) {
        toastService.warning(t("products.out_of_stock"));
        return;
      }
      guestCart.add(
        {
          productId,
          variantId,
          name: product.name,
          description: product.description,
          translations: product.translations,
          color: variant.color,
          storage: variant.storage,
          variantTranslations: variant.translations,
          stock: variant.stock,
          image: variant.images?.[0] || product.image || null,
          // charge the discounted price when the product is on sale (matches
          // the backend addToCart, so guest + merged carts stay consistent)
          price: salePrice(variant.price, product.discountPercent),
        },
        quantity
      );
      loadGuestCart();
      const snap = buildSnapshot();
      if (snap) setAddedItem(snap);
      else toastService.success(t("cart.added"));
      return;
    }

    // Logged in: persist on the server.
    try {
      await cartService.addToCart({ productId, variantId, quantity });
      await fetchCart();
      const snap = buildSnapshot();
      if (snap) setAddedItem(snap);
      else toastService.success(t("cart.added"));
    } catch (err) {
      // An expired session can still 401 here — prompt to sign in rather than
      // leaking the raw "No token provided".
      if (err.response?.status === 401) {
        toastService.authRequired();
        return;
      }
      console.log(err);
      toastService.error(apiMessage(err, t("cart.add_failed")));
    }
  };

  const updateQuantity = async (productId, variantId, quantity) => {
    if (!isLoggedIn) {
      guestCart.setQuantity(variantId, quantity);
      loadGuestCart();
      return;
    }
    try {
      await cartService.updateQuantity(productId, variantId, quantity);
      await fetchCart();
    } catch (err) {
      if (err.response?.status === 401) {
        toastService.authRequired();
        return;
      }
      toastService.error(apiMessage(err, t("cart.update_failed")));
    }
  };

  const removeItem = async (variantId) => {
    if (!isLoggedIn) {
      guestCart.remove(variantId);
      loadGuestCart();
      return;
    }
    await cartService.removeFromCart(variantId);
    await fetchCart();
  };

  // Bundle offers require an account (the login gate is here, not at checkout,
  // because bundle carts aren't stored locally for guests).
  const addBundleToCart = async (bundleId, quantity = 1) => {
    if (!isLoggedIn) {
      toastService.authRequired();
      return false;
    }
    try {
      await cartService.addBundle(bundleId, quantity);
      await fetchCart();
      toastService.success(t("offers.added_to_cart"));
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        toastService.authRequired();
        return false;
      }
      toastService.error(apiMessage(err, t("offers.add_failed")));
      return false;
    }
  };

  const removeBundle = async (bundleId) => {
    if (!isLoggedIn) return;
    await cartService.removeBundle(bundleId);
    await fetchCart();
  };

  const cartCount =
    cart.items.reduce((sum, item) => sum + item.quantity, 0) +
    (cart.bundles || []).reduce((sum, b) => sum + b.quantity, 0);

  // Cart follows the resolved auth state. We wait for auth to finish booting
  // (authLoading === false) so we never act on an unverified session.
  //  • logged in  → merge any guest cart into the server, then load it
  //  • guest      → load the local cart
  useEffect(() => {
    if (authLoading) return;

    if (user?._id) {
      (async () => {
        // Clear the guest cart FIRST (synchronously) so React StrictMode's
        // double-invoke can't merge the same items twice.
        const pending = guestCart.read();
        if (pending.length) {
          guestCart.clear();
          for (const it of pending) {
            try {
              await cartService.addToCart({
                productId: it.productId,
                variantId: it.variantId,
                quantity: it.quantity,
              });
            } catch {
              // Skip items that can't be added (e.g. out of stock) — the rest
              // still merge.
            }
          }
          toastService.success(t("cart.merged"));
        }
        fetchCart();
      })();
    } else {
      sessionRef.current = null;
      loadGuestCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, authLoading]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoggedIn,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        addBundleToCart,
        removeBundle,
        addedItem,
        clearAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
