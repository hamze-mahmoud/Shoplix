import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tags, Plus, Minus, ShoppingCart, ArrowLeft, Loader2, Package, Check } from "lucide-react";

import { offerService } from "../../../Shared/services/offerService";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../../Shared/utils/formPrice";
import { onImgError } from "../../../Shared/utils/imageFallback";
import { localized } from "../../../Shared/utils/localize";
import Countdown from "../../../Shared/components/Countdown";

export default function OfferDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addBundleToCart } = useCart();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    offerService
      .getOffer(id)
      .then((res) => setOffer(res.data.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!offer) return;
    setAdding(true);
    // optional chaining: the React Compiler hoists this dependency read into
    // the render phase (before the loading guard), so it must be null-safe.
    const ok = await addBundleToCart(offer?._id, qty);
    setAdding(false);
    if (ok) navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <Tags className="w-12 h-12 text-gray-300" />
        <h2 className="text-2xl font-display">{t("offers.not_found")}</h2>
        <Link to="/offers" className="px-6 py-3 rounded-xl bg-[#111827] text-white font-semibold hover:bg-[#2563EB] transition">
          {t("offers.back_to_offers")}
        </Link>
      </div>
    );
  }

  const images = offer.images?.length ? offer.images : [];
  const offerTitle = localized(offer, "title", i18n.language) || offer.title;
  const offerDesc = localized(offer, "description", i18n.language) || offer.description;

  return (
    <div className="bg-[#F8F9FA] text-[#111827] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 sm:py-12">
        <Link to="/offers" className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-[#2563EB] mb-6">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("offers.back_to_offers")}
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* GALLERY */}
          <div>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-black/10">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={offerTitle} onError={onImgError} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="w-12 h-12" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg ? "border-[#2563EB]" : "border-black/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" onError={onImgError} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#2563EB]">
              <Tags className="w-4 h-4" />
              {t("offers.bundle_deal")}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl mt-2">{offerTitle}</h1>
            {offerDesc && <p className="text-black/55 mt-3">{offerDesc}</p>}

            {/* PRICE */}
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold text-[#2563EB]">{formatPrice(offer.offerPrice)}</span>
              {offer.originalTotal > offer.offerPrice && (
                <>
                  <span className="text-lg text-black/40 line-through mb-1">{formatPrice(offer.originalTotal)}</span>
                  <span className="mb-1.5 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {t("offers.save")} {formatPrice(offer.savings)}
                  </span>
                </>
              )}
            </div>

            {/* ⏰ urgency: live countdown to offer end */}
            <Countdown until={offer.endDate} mode="boxes" className="mt-5" />

            {/* QTY + ADD */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-40">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} disabled={!offer.inStock} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-40">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding || !offer.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white bg-[#111827] hover:bg-[#2563EB] shadow-md active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                {offer.inStock ? t("offers.add_bundle") : t("offers.out_of_stock")}
              </button>
            </div>

            {/* INCLUDED PRODUCTS */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-3">{t("offers.whats_included")}</h3>
              <div className="space-y-2">
                {offer.products.map((p) => (
                  <div key={p.variantId} className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl p-3">
                    {p.image ? (
                      <img src={p.image} alt="" onError={onImgError} className="w-14 h-14 rounded-xl object-cover border border-black/5 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{localized(p, "name", i18n.language) || p.name}</p>
                      <p className="text-xs text-black/50">
                        {[p.color, p.storage].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#111827] text-white px-2 py-1 rounded-lg">
                        <Check className="w-3 h-3" /> ×{p.quantity}
                      </span>
                      <p className="text-xs text-black/40 mt-1 line-through">{formatPrice(p.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-black/40 mt-4">{t("offers.ends_on")} {new Date(offer.endDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
