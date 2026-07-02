import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

import { useCart } from "../context/CartContext";
import { localized } from "../../Shared/utils/localize";
import { formatPrice } from "../../Shared/utils/formPrice";
import { onImgError } from "../../Shared/utils/imageFallback";

const AUTO_DISMISS_MS = 5000;

// Small informational popover anchored under the cart icon — confirms what
// was just added without leaving the page or blocking on a modal. Purely
// informational: it shows the item and a link to the cart, nothing more.
export default function AddedToCartPopover() {
  const { addedItem, clearAddedItem, cart } = useCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const panelRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!addedItem) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(clearAddedItem, AUTO_DISMISS_MS);

    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) clearAddedItem();
    };
    const onKey = (e) => {
      if (e.key === "Escape") clearAddedItem();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedItem?.nonce]);

  if (!addedItem) return null;

  const name = localized(
    { name: addedItem.name, translations: addedItem.translations },
    "name",
    lang
  );
  const color = localized(
    { color: addedItem.color, translations: addedItem.variantTranslations },
    "color",
    lang
  );
  const storage = localized(
    { storage: addedItem.storage, translations: addedItem.variantTranslations },
    "storage",
    lang
  );

  return (
    <div
      ref={panelRef}
      dir={i18n.dir()}
      role="status"
      className="absolute end-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-black/[0.06] rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border-b border-green-100">
        <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </span>
        <p className="text-sm font-semibold text-green-800 flex-1">{t("cart.added")}</p>
        <button
          onClick={clearAddedItem}
          aria-label={t("common.close")}
          className="p-1 rounded-lg text-green-700/60 hover:text-green-900 hover:bg-green-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Item */}
      <div className="flex gap-3 p-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F8F9FA] shrink-0">
          {addedItem.image && (
            <img
              src={addedItem.image}
              alt={name}
              onError={onImgError}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] line-clamp-1">{name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {color && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#111827]/5 text-[#111827]/70">
                {color}
              </span>
            )}
            {storage && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#111827]/5 text-[#111827]/70">
                {storage}
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-green-600 mt-1.5">
            {formatPrice(addedItem.price)}
            <span className="text-xs font-normal text-gray-400"> × {addedItem.quantity}</span>
          </p>
        </div>
      </div>

      {/* Footer: running cart total */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-t border-black/[0.04] flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {t("cart.items", { count: cart.items.length })} · {formatPrice(cart.total)}
        </span>
        <Link
          to="/cart"
          onClick={clearAddedItem}
          className="text-xs font-semibold text-[#111827] hover:text-green-600 transition-colors"
        >
          {t("cart.view_cart")}
        </Link>
      </div>
    </div>
  );
}
