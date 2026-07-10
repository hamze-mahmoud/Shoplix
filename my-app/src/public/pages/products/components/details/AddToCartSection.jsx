import { useState } from "react";
import { ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "../../../../context/CartContext";
import gsap from "gsap";
import { toastService } from "../../../../../Shared/services/toastService";
import { flyToCart } from "../../../../../Shared/utils/flyToCart";

export default function AddToCartSection({ product, variant }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const maxQty = variant?.stock || 10;
  const isOutOfStock = variant && variant.stock === 0;

  const handleAdd = async (e) => {
    if (!variant) {
      toastService.warning(t("products.select_variant"));
      return;
    }
    if (isOutOfStock) return;

    // Snapshot the fly source BEFORE the await (layout may shift after).
    // Prefer the real product photo; fall back to the button itself.
    const btn = e.currentTarget;
    const flySource =
      document.querySelector("[data-product-image]") || btn;
    const flyImage = variant?.images?.[0] || product?.image;

    setAdding(true);
    try {
      // Pass the full product + variant so a guest cart can store a display
      // snapshot locally (logged-in users only need the ids).
      await addToCart({
        productId: product._id,
        variantId: variant._id,
        quantity,
        product,
        variant,
      });

      // Dopamine: the product image arcs into the cart, badge pops +1.
      flyToCart({ imageUrl: flyImage, source: flySource });

      gsap.fromTo(btn,
        { scale: 1 },
        { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    } catch {
      // addToCart already surfaces its own themed toast (incl. the sign-in
      // prompt on 401); nothing extra to show here.
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#111827]/60 font-medium">Qty:</span>
        <div className="flex items-center gap-2 bg-[#111827]/5 rounded-xl p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-yellow-400 transition disabled:opacity-40"
            disabled={quantity <= 1}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-bold text-[#111827]">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-yellow-400 transition disabled:opacity-40"
            disabled={quantity >= maxQty}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {variant && (
          <span className="text-xs text-[#111827]/40">
            ({variant.stock} available)
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={adding || isOutOfStock || !variant}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[#111827] bg-gradient-to-r from-yellow-400 to-green-500 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding
            ? t("common.loading")
            : isOutOfStock
            ? t("products.out_of_stock")
            : t("products.add_to_cart")}
        </button>

        <button
          className="w-12 h-12 rounded-2xl border border-[#111827]/10 flex items-center justify-center hover:bg-[#111827] hover:border-[#111827] hover:text-yellow-400 text-[#111827] transition-all"
          title="Add to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
