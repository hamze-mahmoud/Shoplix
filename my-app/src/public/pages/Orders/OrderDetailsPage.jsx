import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { toastService } from "../../../Shared/services/toastService";
import { formatPrice } from "../../../Shared/utils/formPrice";
import {
  ArrowLeft,
  Copy,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Package,
  ShoppingBag,
  X,
  CalendarClock,
} from "lucide-react";

import { orderService } from "../../../Shared/services/orderService";
import { localized } from "../../../Shared/utils/localize";
import { onImgError } from "../../../Shared/utils/imageFallback";
import OrderStatusBadge from "./components/OrderStatusBadge";
import OrderTimeline from "./components/OrderTimeline";

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="h-8 w-28 rounded-full bg-gray-200" />
      </div>
      <div className="h-24 rounded-3xl bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-28 rounded-3xl bg-gray-200" />
          <div className="h-28 rounded-3xl bg-gray-200" />
        </div>
        <div className="h-64 rounded-3xl bg-gray-200" />
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await orderService.getOrderById(id);
        if (active) setOrder(data.data);
      } catch (err) {
        if (active) setError(true);
        console.error("Failed to load order", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // GSAP entrance animation once the order is rendered
  useEffect(() => {
    if (!order || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-animate]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [order]);

  const copyId = () => {
    navigator.clipboard?.writeText(order._id);
    toastService.success(t("orders.id_copied"));
  };

  const confirmCancel = () => {
    toastService.confirm({
      message: t("orders.cancel_confirm"),
      confirmLabel: t("orders.cancel_yes"),
      cancelLabel: t("orders.cancel_no"),
      variant: "error",
      onConfirm: doCancel,
    });
  };

  const doCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(order._id);
      setOrder((o) => ({ ...o, status: "cancelled" }));
      toastService.success(t("orders.order_cancelled"));
    } catch (err) {
      const e = err.response?.data?.error;
      toastService.error(typeof e === "string" ? e : e?.message || t("orders.cancel_failed"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50/60"><DetailsSkeleton /></div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-sm">
          <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900">{t("orders.not_found")}</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">{t("orders.not_found_desc")}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-[#16A34A] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("orders.back")}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
  const shipping = order.shippingCost || 0;
  const canCancel = ["placed", "confirmed", "preparing", "pending", "processing", "paid"].includes(order.status);
  const isClosed = ["delivered", "cancelled"].includes(order.status);
  const dateStr = new Date(order.createdAt).toLocaleDateString(i18n.language, {
    year: "numeric", month: "short", day: "numeric",
  });

  // Estimated delivery: stored value, or fall back to createdAt + 7 days (legacy orders)
  const eta = order.estimatedDelivery
    ? new Date(order.estimatedDelivery)
    : new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);
  const etaStr = eta.toLocaleDateString(i18n.language, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div ref={containerRef} className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-10">

        {/* BACK */}
        <Link
          to="/orders"
          data-animate
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("orders.back")}
        </Link>

        {/* HEADER */}
        <div data-animate className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {t("orders.order_number", { id: order._id.slice(-6) })}
              </h1>
              <button
                onClick={copyId}
                title={t("orders.copy_id")}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">{t("orders.placed_on")} {dateStr}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* TIMELINE */}
        <div data-animate className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <OrderTimeline status={order.status} />

          {/* ESTIMATED DELIVERY */}
          {!isClosed && (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-[#FEFCE8] border border-green-100 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <CalendarClock className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-semibold">{t("orders.estimated_delivery")}</p>
                <p className="text-sm font-bold text-gray-900">{t("orders.arrives_by", { date: etaStr })}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t("orders.delivery_window")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT: items + addresses */}
          <div className="lg:col-span-2 space-y-6">

            {/* ITEMS */}
            <div data-animate className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                <ShoppingBag className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-gray-900">{t("orders.items")}</h3>
                <span className="text-sm text-gray-400">
                  · {t("orders.item_count", { count: order.items.length })}
                </span>
              </div>

              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={item._id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition">
                    <div className="h-16 w-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      {item.productImage ? (
                        <img src={item.productImage} onError={onImgError} className="h-full w-full object-cover" alt={item.productName} loading="lazy" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {localized({ name: item.productName, translations: item.translations }, "name", i18n.language)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {item.color && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {localized({ color: item.color, translations: item.variantTranslations }, "color", i18n.language)}
                          </span>
                        )}
                        {item.storage && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {localized({ storage: item.storage, translations: item.variantTranslations }, "storage", i18n.language)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {t("orders.qty")}: {item.quantity}
                      </p>
                    </div>

                    <div className="text-end shrink-0">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price)} {t("orders.each")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SHIPPING + PAYMENT */}
            <div data-animate className="grid sm:grid-cols-2 gap-6">
              {/* SHIPPING */}
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-gray-900">{t("orders.shipping_address")}</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <p className="font-medium text-gray-900">{order.shippingAddress.description}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <h3 className="font-bold text-gray-900">{t("orders.payment")}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t("orders.payment_method")}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.paymentMethod === "cash_on_delivery"
                        ? t("orders.cash_on_delivery")
                        : order.paymentMethod.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: summary */}
          <div data-animate className="lg:col-span-1">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sticky top-24 space-y-4">
              <h3 className="font-bold text-gray-900">{t("orders.details")}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t("orders.subtotal")}</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("orders.shipping")}</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">{t("orders.total")}</span>
                  <span className="text-xl font-black text-green-600">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>

              {canCancel && (
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 py-2.5 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  {t("orders.cancel_order")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
