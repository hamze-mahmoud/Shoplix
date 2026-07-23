import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toastService } from "../../../Shared/services/toastService";

import { useCart } from "../../context/CartContext";
import { orderService } from "../../../Shared/services/orderService";
import { computeDelivery } from "../../../Shared/utils/shipping";
import PaymentMethod from "./PaymentMethod";
import OrderReview from "./OrderReview";
import DeliveryFeeConfirm from "./DeliveryFeeConfirm";

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    region: "", city: "", description: "", phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  // Delivery-fee confirmation step: opens after "Place order" so the customer
  // acknowledges the fee is an estimate we'll confirm by WhatsApp/call.
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);

  const hasRegion = !!shippingAddress.region;
  const estimatedDelivery = hasRegion
    ? computeDelivery(cart?.items || [], shippingAddress.region)
    : 0;

  // Step 1 — validate the address, then open the delivery-fee confirmation step
  // instead of placing the order straight away.
  const handlePlaceOrder = () => {
    const { region, city, description, phone } = shippingAddress;
    if (!region || !city || !description || !phone) {
      toastService.warning(t("checkout.fill_address"));
      return;
    }
    setShowDeliveryConfirm(true);
  };

  // Step 2 — the customer confirmed; actually create the order.
  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      // Record the language the customer ordered in so confirmations (e.g. the
      // admin's WhatsApp message) are sent back in their language.
      const language = (i18n.language || "en").split("-")[0];
      await orderService.createOrder({ shippingAddress, paymentMethod, language });
      // The server emptied the cart with the order — refresh local state so the
      // navbar badge and cart page clear immediately.
      await fetchCart();
      setShowDeliveryConfirm(false);
      toastService.success(t("checkout.order_placed"));
      navigate("/orders");
    } catch (err) {
      const e = err.response?.data?.error;
      toastService.error(typeof e === "string" ? e : e?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8">
          {t("checkout.title")}
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
            />
          </div>

          <div>
            <OrderReview
              cart={cart}
              shippingAddress={shippingAddress}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Delivery-fee confirmation step */}
      <DeliveryFeeConfirm
        isOpen={showDeliveryConfirm}
        onClose={() => !loading && setShowDeliveryConfirm(false)}
        onConfirm={handleConfirmOrder}
        loading={loading}
        deliveryFee={estimatedDelivery}
        hasRegion={hasRegion}
      />
    </div>
  );
}
