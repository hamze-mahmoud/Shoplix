import { useRef } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toastService } from "../../../../Shared/services/toastService";
import gsap from "gsap";
import { useCart } from "../../../context/CartContext";
import { localized } from "../../../../Shared/utils/localize";
import { onImgError } from "../../../../Shared/utils/imageFallback";
import { formatPrice } from "../../../../Shared/utils/formPrice";

export default function CartItem({ item }) {
  const { t, i18n } = useTranslation();
  const { removeItem, updateQuantity } = useCart();
  const cardRef = useRef();
  const qtyRef = useRef();

  const lang = i18n.language;
  const name = localized({ name: item.name, translations: item.translations }, "name", lang);
  const color = localized({ color: item.color, translations: item.variantTranslations }, "color", lang);
  const storage = localized({ storage: item.storage, translations: item.variantTranslations }, "storage", lang);

  const maxStock = item.stock ?? Infinity;
  const atMax = item.quantity >= maxStock;

  const handleRemove = () => {
    gsap.to(cardRef.current, {
      opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0, duration: 0.3,
      ease: "power2.in", onComplete: () => removeItem(item.variantId),
    });
  };

  const handleQtyChange = (delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (delta > 0 && newQty > maxStock) {
      toastService.warning(t("products.low_stock", { count: maxStock }));
      return;
    }
    updateQuantity(item.productId, item.variantId, newQty);
    gsap.fromTo(qtyRef.current, { scale: 0.75 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
  };

  return (
    <div
      ref={cardRef}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#111827]/15 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] shrink-0">
        <img
          src={item.image}
          alt={name}
          loading="lazy"
          onError={onImgError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* DETAILS */}
      <div className="flex-1 min-w-0 space-y-2">
        <h3 className="font-bold text-[#111827] line-clamp-1">{name}</h3>

        <div className="flex flex-wrap gap-1.5">
          {color && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#111827]/5 text-[#111827]/70">
              {color}
            </span>
          )}
          {storage && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {storage}
            </span>
          )}
        </div>

        {/* QTY CONTROLS */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleQtyChange(-1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span ref={qtyRef} className="w-8 text-center font-bold text-[#111827]">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQtyChange(1)}
            disabled={atMax}
            title={atMax ? t("products.low_stock", { count: maxStock }) : ""}
            className="w-8 h-8 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {item.stock != null && item.stock <= 5 && (
          <p className="text-[11px] font-medium text-orange-500">
            {atMax ? t("products.max_in_cart", "Max available in cart") : t("products.low_stock", { count: item.stock })}
          </p>
        )}
      </div>

      {/* PRICE + REMOVE */}
      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto">
        <div className="text-end">
          <p className="text-xl font-extrabold text-green-600">{formatPrice(item.subtotal)}</p>
          <p className="text-xs text-gray-400">{formatPrice(item.price)} {t("cart.each")}</p>
        </div>
        <button
          onClick={handleRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#111827] hover:text-white transition-colors text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("cart.remove")}
        </button>
      </div>
    </div>
  );
}
