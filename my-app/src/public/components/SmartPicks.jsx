import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wand2, Sparkles, ArrowRight } from "lucide-react";

import { productService } from "../../Shared/services/productService";
import ProductCarousel from "./ProductCarousel";
import Reveal from "../../Shared/components/Reveal";

// Home teaser for the AI picks: a rail of the current "for everyone" mix,
// with season/event chips, linking to the full Tailored-for-you page.
// Renders nothing until (and unless) recommendations load.
export default function SmartPicks() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [context, setContext] = useState(null);

  useEffect(() => {
    let alive = true;
    productService
      .getSmartRecommendations({ limit: 8 })
      .then((res) => {
        if (!alive) return;
        setProducts(res.data?.products || []);
        setContext(res.data?.context || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-24">
      <Reveal className="mb-10 sm:mb-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#2563EB]">
              <Wand2 className="w-4 h-4" />
              {t("home.picks_kicker")}
            </p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">{t("home.picks_title")}</h2>
            <p className="text-black/55 mt-2 max-w-lg">{t("home.picks_subtitle")}</p>
            {(context?.events?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {context.events.map((ev) => (
                  <span
                    key={ev.key}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-[#2563EB] border border-blue-100 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t(`tailored.event_${ev.key}`, ev.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/tailored"
            className="btn-press inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors"
          >
            {t("home.picks_cta")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </Reveal>

      <ProductCarousel products={products} />
    </section>
  );
}
