import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Truck, MessageCircle, Phone, Wallet, Loader2, ArrowLeft } from "lucide-react";
import { formatPrice } from "../../../Shared/utils/formPrice";

// Delivery-fee confirmation step. Shown after the customer taps "Place order":
// the fee our formula produced is only an ESTIMATE, so the customer explicitly
// acknowledges that our team will confirm the final amount by WhatsApp/call
// (within 1–2h) before the order is actually created.
export default function DeliveryFeeConfirm({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  deliveryFee = 0,
  hasRegion = true,
}) {
  const { t } = useTranslation();

  // Lock body scroll while open.
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 bg-gradient-to-br from-[#111827] to-green-700 text-white">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{t("checkout.confirm_delivery_title")}</h2>
            <p className="text-xs text-green-100/80">{t("checkout.confirm_delivery_sub")}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Estimated fee */}
          <div className="flex items-center justify-between rounded-2xl bg-green-50 border border-green-100 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">
              {t("checkout.confirm_delivery_estimate_label")}
            </span>
            <span dir="ltr" className="text-xl font-black text-green-700">
              {hasRegion ? `≈ ${formatPrice(deliveryFee)}` : "—"}
            </span>
          </div>

          {/* The note: we'll confirm within 1–2h */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-sm text-amber-900 leading-relaxed">
              {t("checkout.confirm_delivery_note")}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-amber-800">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> {t("checkout.confirm_delivery_whatsapp")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> {t("checkout.confirm_delivery_call")}
              </span>
            </div>
          </div>

          {/* Cash-on-delivery reassurance */}
          <p className="flex items-start gap-2 text-xs text-gray-500">
            <Wallet className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            {t("checkout.confirm_delivery_cod")}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("checkout.confirm_delivery_back")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t(loading ? "checkout.placing_order" : "checkout.confirm_delivery_confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
