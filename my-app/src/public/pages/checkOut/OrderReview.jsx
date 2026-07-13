import { ShieldCheck, Truck, Wallet, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localized } from "../../../Shared/utils/localize";
import { onImgError } from "../../../Shared/utils/imageFallback";
import { formatPrice } from "../../../Shared/utils/formPrice";
import { computeDelivery } from "../../../Shared/utils/shipping";

export default function OrderReview({ cart, shippingAddress, onPlaceOrder, loading }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const itemsTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasRegion = !!shippingAddress?.region;
  // Size-aware delivery: base region fee × each item's size multiplier × qty.
  const shippingCost = hasRegion
    ? computeDelivery(cart.items, shippingAddress.region)
    : 0;
  const grandTotal = itemsTotal + shippingCost;

  return (
    <div className="sticky top-24 overflow-hidden rounded-3xl bg-white shadow-md border border-gray-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#111827] to-green-800 p-6 text-white">
        <p className="text-sm text-white/70">{t("checkout.summary")}</p>
        <h2 className="mt-1 text-3xl font-black">{formatPrice(grandTotal)}</h2>
        <p className="mt-1 text-sm text-white/60">
          {t("checkout.items_count", { count: totalItems })}
        </p>
      </div>

      {/* Item list */}
      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50">
        {cart.items.map((item) => (
          <div key={`${item.productId}-${item.color}-${item.storage}`}
            className="flex gap-3 p-4 hover:bg-gray-50 transition">
            <img src={item.image} alt={item.name} onError={onImgError}
              className="h-16 w-16 rounded-xl object-cover shrink-0 bg-gray-100" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm line-clamp-1">
                {localized({ name: item.name, translations: item.translations }, "name", lang)}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.color && (
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {localized({ color: item.color, translations: item.variantTranslations }, "color", lang)}
                  </span>
                )}
                {item.storage && (
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {localized({ storage: item.storage, translations: item.variantTranslations }, "storage", lang)}
                  </span>
                )}
                <span className="text-[11px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                  ×{item.quantity}
                </span>
              </div>
            </div>
            <p className="font-bold text-sm text-gray-900 shrink-0">{formatPrice(item.subtotal)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t("cart.subtotal")}</span>
          <span className="font-medium">{formatPrice(itemsTotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{t("cart.shipping")}</span>
          <span className={hasRegion ? "font-medium" : "text-gray-400"}>
            {hasRegion ? formatPrice(shippingCost) : t("checkout.select_region")}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-lg">
          <span>{t("checkout.grand_total")}</span>
          <span className="text-green-600">{formatPrice(grandTotal)}</span>
        </div>

        {/* Trust signals */}
        <div className="space-y-2 pt-2">
          {[
            { icon: ShieldCheck, text: t("checkout.secure_checkout") },
            { icon: Truck, text: t("checkout.fast_delivery") },
            { icon: Wallet, text: t("checkout.cash_on_delivery") },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
              <Icon className="w-3.5 h-3.5 text-green-500 shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onPlaceOrder}
          disabled={loading || cart.items.length === 0}
          className="w-full flex items-center justify-center gap-2 mt-2 py-4 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading
            ? t("checkout.placing_order")
            : `${t("checkout.place_order")} • ${formatPrice(grandTotal)}`}
        </button>

        <p className="text-center text-xs text-gray-400">{t("checkout.secure_payment")}</p>
      </div>
    </div>
  );
}
