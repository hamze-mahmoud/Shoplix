import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { toastService } from "../../../../Shared/services/toastService";
import { formatPrice } from "../../../../Shared/utils/formPrice";

export default function CartSummary() {
  const { cart, isLoggedIn } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCheckout = () => {
    // Guests build their cart freely; the sign-in gate is here, at checkout.
    // We remember /checkout so they're returned there right after logging in
    // (their guest cart is merged into the account on login).
    if (!isLoggedIn) {
      toastService.info(t("cart.login_to_checkout"));
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-5">

      <h2 className="text-lg font-bold text-[#111827]">{t("cart.order_summary")}</h2>

      {/* BREAKDOWN */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{t("cart.subtotal")}</span>
          <span className="font-medium text-[#111827]">{formatPrice(cart.total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t("cart.shipping")}</span>
          <span className="text-gray-400">{t("cart.shipping_at_checkout")}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-[#111827]">
          <span>{t("cart.total")}</span>
          <span className="text-green-600 text-lg">{formatPrice(cart.total)}</span>
        </div>
      </div>

      {/* CHECKOUT BUTTON */}
      <button
        onClick={handleCheckout}
        className="btn-press w-full py-3.5 bg-[#111827] text-white rounded-full font-semibold hover:bg-green-600 active:scale-[0.98] transition-colors duration-300"
      >
        {t("cart.checkout")}
      </button>

      {/* TRUST SIGNALS */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>{t("cart.secure_checkout")}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-gray-500">
          <Truck className="w-4 h-4 text-green-500 shrink-0" />
          <span>{t("cart.fast_delivery")}</span>
        </div>
      </div>
    </div>
  );
}
