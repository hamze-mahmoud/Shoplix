import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCart } from "../../context/CartContext";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";

export default function Cart() {
  const { cart } = useCart();
  const { t } = useTranslation();
  const isEmpty = !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#111827] transition"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("common.back")}
          </Link>
          <div className="flex-1" />
          <h1 className="text-2xl sm:text-3xl font-black text-[#111827]">
            {t("cart.title")}
          </h1>
          {!isEmpty && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-400 text-[#111827]">
              {t("cart.items", { count: cart.items.length })}
            </span>
          )}
        </div>

        {isEmpty ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#111827] flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">{t("cart.empty")}</h2>
            <p className="text-gray-500 mb-8 max-w-sm">{t("cart.empty_desc")}</p>
            <Link
              to="/products"
              className="btn-press px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-yellow-400 hover:text-[#111827] transition-colors duration-300"
            >
              {t("cart.start_shopping")}
            </Link>
          </div>
        ) : (
          /* CART CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.variantId || item.productId} item={item} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
