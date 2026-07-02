import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, AtSign, Camera } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { label: t("footer.all_products"), to: "/products" },
        { label: t("footer.categories"), to: "/categories" },
        { label: t("footer.shopping_cart"), to: "/cart" },
      ],
    },
    {
      title: t("footer.contact"),
      links: [
        { label: t("nav.about"), to: "/about" },
        { label: t("nav.contact"), to: "/contact" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("footer.help_center"), to: "/contact" },
        { label: t("footer.shipping_info"), to: "/contact" },
        { label: t("footer.returns"), to: "/contact" },
        { label: t("footer.privacy"), to: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-[#111827] text-white">
      <div className="h-1 bg-gradient-to-r from-[#16A34A] via-[#FACC15] to-[#16A34A]" />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">

          {/* BRAND */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="font-display text-3xl tracking-tight">
              Shoplix<span className="text-[#FACC15]">.</span>
            </Link>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs font-light">
              {t("footer.brand_desc")}
            </p>
            <div className="flex gap-3 pt-1">
              {[Globe, AtSign, Camera].map((Icon, i) => (
                <button
                  key={i}
                  aria-label="Social link"
                  className="btn-press w-10 h-10 rounded-full border border-white/15 text-white/70 hover:text-[#4ADE80] hover:border-[#4ADE80]/50 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-8">
            {columns.map((col, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-5">
                  {col.title}
                </h3>
                <ul className="space-y-3 text-sm text-white/70 font-light">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.to} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONTACT INFO */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-5">
              {t("contact.label")}
            </h3>
            <p className="text-sm text-white/70 font-light">support@shoplix.com</p>
            <p className="text-sm text-white/70 font-light">+970 123 456 789</p>
            <p className="text-sm text-white/50 font-light">{t("contact.address")}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 text-center text-xs uppercase tracking-[0.18em] text-white/40">
          {t("footer.rights", { year })}
        </div>
      </div>
    </footer>
  );
}
