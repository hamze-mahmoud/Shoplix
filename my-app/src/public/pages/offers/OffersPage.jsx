import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tags, ArrowRight, Package, Loader2 } from "lucide-react";

import { offerService } from "../../../Shared/services/offerService";
import { formatPrice } from "../../../Shared/utils/formPrice";
import { onImgError } from "../../../Shared/utils/imageFallback";
import { localized } from "../../../Shared/utils/localize";
import Reveal from "../../../Shared/components/Reveal";

export default function OffersPage() {
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerService
      .getOffers()
      .then((res) => setOffers(res.data.data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F8F9FA] text-[#111827] min-h-screen">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 pt-14 sm:pt-20 pb-8">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#2563EB]">
          <Tags className="w-4 h-4" />
          {t("offers.kicker")}
        </p>
        <h1 className="font-display text-4xl sm:text-6xl mt-3">{t("offers.title")}</h1>
        <p className="text-black/55 mt-3 max-w-xl">{t("offers.subtitle")}</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 pb-20">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-gray-400 py-20">
            <Loader2 className="w-5 h-5 animate-spin" /> {t("common.loading")}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tags className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{t("offers.empty")}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((o) => (
              <Reveal key={o._id}>
                <Link
                  to={`/offers/${o._id}`}
                  className="group block bg-white rounded-3xl border border-black/10 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F9FA]">
                    {o.images?.[0] ? (
                      <img
                        src={o.images[0]}
                        alt={localized(o, "title", i18n.language) || o.title}
                        onError={onImgError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    {o.savingsPercent > 0 && (
                      <span className="absolute top-4 start-4 bg-[#2563EB] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        -{o.savingsPercent}%
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-xl leading-snug line-clamp-1">{localized(o, "title", i18n.language) || o.title}</h3>
                    <p className="text-sm text-black/50 mt-1">
                      {o.products?.length} {t("offers.items_included")}
                    </p>

                    <div className="flex items-end gap-2 mt-4">
                      <span className="text-2xl font-bold text-[#2563EB]">{formatPrice(o.offerPrice)}</span>
                      {o.originalTotal > o.offerPrice && (
                        <span className="text-sm text-black/40 line-through mb-1">{formatPrice(o.originalTotal)}</span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#111827] mt-4 link-underline">
                      {t("offers.view_offer")}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
