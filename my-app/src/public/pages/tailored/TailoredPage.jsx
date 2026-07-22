import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users, Baby, GraduationCap, Venus, Mars, Armchair,
  BrainCircuit, CalendarDays, RefreshCw, PackageSearch,
} from "lucide-react";

import { productService } from "../../../Shared/services/productService";
import ProductCard from "../products/components/listing/ProductCard";
import Reveal from "../../../Shared/components/Reveal";

// Audience segments shown in the sidebar. "all" = the general AI mix.
const SEGMENTS = [
  { key: "all", icon: Users },
  { key: "kids", icon: Baby },
  { key: "young", icon: GraduationCap },
  { key: "women", icon: Venus },
  { key: "men", icon: Mars },
  { key: "elderly", icon: Armchair },
];

export default function TailoredPage() {
  const { t } = useTranslation();

  const [segment, setSegment] = useState("all");
  const [products, setProducts] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    productService
      .getSmartRecommendations({
        limit: 12,
        audience: segment === "all" ? undefined : segment,
      })
      .then((res) => {
        if (!alive) return;
        setProducts(res.data?.products || []);
        setContext(res.data?.context || null);
      })
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [segment]);

  const eventChips = context?.events || [];

  const segBtn = (active) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-start whitespace-nowrap ${
      active
        ? "bg-[#111827] text-white shadow-md"
        : "bg-white text-[#111827]/75 border border-black/10 hover:border-[#16A34A]/50 hover:text-[#111827]"
    }`;

  return (
    <div className="bg-[#F8F9FA] text-[#111827] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* HEADER */}
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#16A34A]">
            <BrainCircuit className="w-4 h-4" />
            {t("tailored.kicker")}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl mt-2">{t("tailored.title")}</h1>
          <p className="text-black/55 mt-2 max-w-2xl">{t("tailored.subtitle")}</p>

          {/* season/event context chips */}
          {eventChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {eventChips.map((ev) => (
                <span
                  key={ev.key}
                  className="inline-flex items-center gap-1.5 bg-green-50 text-[#16A34A] border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  <CalendarDays className="w-3 h-3" />
                  {t(`tailored.event_${ev.key}`, ev.name)}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs text-black/40">
                <RefreshCw className="w-3 h-3" />
                {t("tailored.updates_hint")}
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* ===== SIDEBAR (desktop) / CHIP RAIL (mobile) ===== */}
          <aside>
            {/* mobile: edge-to-edge horizontal snap rail · lg: sticky column */}
            <div className="lg:sticky lg:top-24 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar snap-x pb-2 lg:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {SEGMENTS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSegment(key)}
                  className={`${segBtn(segment === key)} shrink-0 snap-start lg:w-full`}
                >
                  <Icon className={`w-4 h-4 ${segment === key ? "text-green-300" : "text-[#16A34A]"}`} />
                  {t(`tailored.seg_${key}`)}
                </button>
              ))}
            </div>
          </aside>

          {/* ===== RESULTS GRID ===== */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/10 p-14 text-center text-black/50">
                <PackageSearch className="w-8 h-8 mx-auto mb-3 opacity-30" />
                {t("tailored.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {products.map((p, i) => (
                  <Reveal key={p._id} delay={Math.min(i * 0.05, 0.3)}>
                    <div>
                      <ProductCard product={p} />
                      {p?.reason && (
                        <p className="mt-1.5 ms-1 inline-flex items-center gap-1.5 text-[11px] text-[#16A34A]">
                          <BrainCircuit className="w-3 h-3" />
                          {p.reason}
                        </p>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
