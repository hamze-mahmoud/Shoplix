import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { formatPrice } from "../../../../Shared/utils/formPrice";
import { localized } from "../../../../Shared/utils/localize";
import { normalizePhone, waUrlForNumber } from "../../../../Shared/utils/whatsapp";
import { toastService } from "../../../../Shared/services/toastService";

export default function OrderDetailsModal({ order, onClose }) {
  const { t, i18n } = useTranslation();
  // Country code to use for ambiguous 056/059 mobiles (Palestine vs Israel).
  const [cc, setCc] = useState("970");
  if (!order) return null;

  const phoneInfo = normalizePhone(order.shippingAddress?.phone);

  // The WhatsApp message is written in the language the CUSTOMER ordered in
  // (falling back to the admin's UI language for older orders that predate the
  // stored `language`). getFixedT translates to that language regardless of the
  // admin's current UI language; admin-facing labels below keep using `t`.
  const msgLang = order.language || i18n.language;
  const tMsg = i18n.getFixedT(msgLang);

  // Build the welcoming WhatsApp confirmation message (greeting + full order
  // breakdown). Prices are in ₪ since that's what the customer pays.
  const buildWhatsAppMessage = () => {
    const fullName = [order.user?.firstName, order.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const greetName = fullName || tMsg("admin.orders.whatsapp.customer");

    const lines = [];
    lines.push(tMsg("admin.orders.whatsapp.greeting", { name: greetName }));
    lines.push("");
    lines.push(tMsg("admin.orders.whatsapp.intro"));
    lines.push("");
    lines.push(tMsg("admin.orders.whatsapp.order_label", { id: order._id.slice(-8) }));
    lines.push("");
    lines.push(tMsg("admin.orders.whatsapp.products_label"));

    (order.items || []).forEach((it) => {
      const itemName =
        localized({ name: it.productName, translations: it.translations }, "name", msgLang) ||
        it.productName;
      const variantStr = [
        localized({ color: it.color, translations: it.variantTranslations }, "color", msgLang) ||
          it.color,
        localized({ storage: it.storage, translations: it.variantTranslations }, "storage", msgLang) ||
          it.storage,
      ]
        .filter(Boolean)
        .join(" / ");
      lines.push(
        tMsg("admin.orders.whatsapp.line_item", {
          name: itemName,
          variant: variantStr ? ` (${variantStr})` : "",
          qty: it.quantity,
          price: formatPrice((it.price || 0) * it.quantity),
        })
      );
    });

    lines.push("");
    const subtotal = (order.items || []).reduce(
      (s, it) => s + (it.price || 0) * it.quantity,
      0
    );
    lines.push(tMsg("admin.orders.whatsapp.subtotal_label", { amount: formatPrice(subtotal) }));
    lines.push(
      tMsg("admin.orders.whatsapp.shipping_label", { amount: formatPrice(order.shippingCost || 0) })
    );
    lines.push(tMsg("admin.orders.whatsapp.total_label", { amount: formatPrice(order.totalPrice) }));
    lines.push("");

    const region = order.shippingAddress?.region
      ? tMsg(`checkout.${order.shippingAddress.region}`, order.shippingAddress.region)
      : "";
    const location = [order.shippingAddress?.city, region, order.shippingAddress?.description]
      .filter(Boolean)
      // drop a repeated part (e.g. city === region) so it doesn't read "Jerusalem, Jerusalem"
      .filter((part, i, arr) => arr.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === i)
      .join(", ");
    lines.push(tMsg("admin.orders.whatsapp.delivery_label", { location }));
    lines.push(
      tMsg("admin.orders.whatsapp.payment_label", {
        method: tMsg(`checkout.${order.paymentMethod}`, order.paymentMethod),
      })
    );
    lines.push("");
    lines.push(tMsg("admin.orders.whatsapp.confirm_question"));

    return lines.join("\n");
  };

  const handleConfirmWhatsApp = () => {
    // For an ambiguous 056/059 number, prepend the admin-selected code.
    const number = phoneInfo.ambiguous ? cc + phoneInfo.localRest : phoneInfo.number;
    const url = waUrlForNumber(number, buildWhatsAppMessage());
    if (!url) {
      toastService.error(t("admin.orders.whatsapp.no_phone"));
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {t("admin.orders.details")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("admin.orders.id")}: #{order._id.slice(-8)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">

          {/* LEFT: CUSTOMER + SHIPPING */}
          <div className="space-y-5">

            {/* Customer */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">
                {t("admin.orders.col_customer")}
              </h3>

              <p className="font-medium">
                {order.user?.firstName} {order.user?.lastName}
              </p>

              <p className="text-sm text-gray-500">
                {order.user?.email}
              </p>
            </div>

            {/* Shipping */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">
                {t("admin.orders.shipping_address")}
              </h3>

              <p className="text-sm">{order.shippingAddress?.city}</p>
              <p className="text-sm">{order.shippingAddress?.region}</p>
              <p className="text-sm">{order.shippingAddress?.phone}</p>
              <p className="text-sm text-gray-500">
                {order.shippingAddress?.description}
              </p>
            </div>

            {/* Payment */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">
                {t("admin.orders.payment")}
              </h3>

              <p className="text-sm">
                {t("admin.orders.method")}: {order.paymentMethod}
              </p>

              <p className="text-sm">
                {t("admin.orders.col_status")}:{" "}
                <span className="font-semibold">
                  {t(`orders.status_${order.status}`, order.status)}
                </span>
              </p>
            </div>
          </div>

          {/* MIDDLE + RIGHT: ITEMS */}
          <div className="md:col-span-2 space-y-4">

            <h3 className="font-semibold text-gray-700">
              {t("admin.orders.products")}
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">

              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 bg-white border rounded-xl p-3 hover:shadow-sm transition"
                >

                  {/* IMAGE */}
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />

                  {/* INFO */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {item.productName}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {t("admin.products.color")}: {item.color} | {t("admin.products.storage")}: {item.storage}
                    </p>

                    <p className="text-sm mt-1">
                      {t("admin.orders.qty")}:{" "}
                      <span className="font-semibold">
                        {item.quantity}
                      </span>
                    </p>
                  </div>

                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-gray-700">
                {t("admin.orders.col_total")}
              </span>

              <span className="text-green-600 font-bold text-lg">
                ${order.totalPrice}
              </span>
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t bg-gray-50">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 min-w-0">
            {order.shippingAddress?.phone ? (
              <span dir="ltr" className="font-medium text-gray-700">
                {order.shippingAddress.phone}
              </span>
            ) : (
              <span className="text-amber-600">{t("admin.orders.whatsapp.no_phone")}</span>
            )}

            {/* 056/059 mobiles can be Palestine (+970) or Israel (+972) — let the admin choose */}
            {phoneInfo.ambiguous && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">
                  {t("admin.orders.whatsapp.country_code")}
                </span>
                {["970", "972"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCc(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      cc === c
                        ? "bg-[#111827] text-white border-[#111827]"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    +{c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmWhatsApp}
            disabled={!phoneInfo.number && !phoneInfo.ambiguous}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm shadow-sm hover:bg-[#1ebe57] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#25D366]"
          >
            <MessageCircle className="w-4 h-4" />
            {t("admin.orders.whatsapp.confirm_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}