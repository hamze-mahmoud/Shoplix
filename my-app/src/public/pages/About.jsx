import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Tag,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Truck,
  MessageCircle,
  PackageCheck,
} from "lucide-react";

import Reveal from "../../Shared/components/Reveal";

export default function About() {
  const { t } = useTranslation();

  const values = [
    { icon: Sparkles, title: t("about.value1_title"), body: t("about.value1_body") },
    { icon: Tag, title: t("about.value2_title"), body: t("about.value2_body") },
    { icon: ShieldCheck, title: t("about.value3_title"), body: t("about.value3_body") },
  ];

  // Real promises, not vanity numbers — each one is something the store
  // actually does (COD, all-region delivery, direct WhatsApp line, human
  // order confirmation). Credibility over fabricated stats.
  const commitments = [
    { icon: Wallet, title: t("about.commit1_title"), body: t("about.commit1_body") },
    { icon: Truck, title: t("about.commit2_title"), body: t("about.commit2_body") },
    { icon: MessageCircle, title: t("about.commit3_title"), body: t("about.commit3_body") },
    { icon: PackageCheck, title: t("about.commit4_title"), body: t("about.commit4_body") },
  ];

  return (
    <div className="bg-[#F8F9FA] text-[#111827]">

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#111827]">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full text-white">
          <Reveal>
            <p className="text-[11px] uppercase tracking-luxe text-white/70 mb-6">{t("about.label")}</p>
            <h1 className="font-display font-light text-5xl sm:text-7xl leading-[0.95] max-w-3xl">
              {t("about.title")}
            </h1>
            <p className="mt-7 text-lg text-white/80 max-w-xl font-light leading-relaxed">{t("about.intro")}</p>
          </Reveal>
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <Reveal x={-30} className="img-zoom aspect-[4/3] bg-[#E5E7EB]">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1100&q=80"
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </Reveal>
          <Reveal x={30}>
            <p className="text-xs uppercase tracking-luxe text-[#16A34A] mb-5">{t("about.story_label")}</p>
            <h2 className="font-display font-light text-4xl sm:text-5xl leading-[1.05]">{t("about.story_title")}</h2>
            <p className="mt-6 text-[#111827]/60 leading-relaxed font-light text-lg max-w-md">{t("about.story_body")}</p>
          </Reveal>
        </div>
      </section>

      {/* COMMITMENTS BAND — true promises instead of vanity stats */}
      <section className="bg-[#111827] text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {commitments.map((c, i) => (
            <Reveal key={i} delay={i * 0.06} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full border border-[#FACC15]/40 flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-[#FACC15]" />
              </div>
              <p className="font-display text-xl sm:text-2xl font-light">{c.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60 max-w-[24ch] mx-auto">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-32">
        <Reveal className="max-w-xl mb-10 sm:mb-16">
          <p className="text-xs uppercase tracking-luxe text-[#16A34A] mb-4">{t("about.values_label")}</p>
          <h2 className="font-display font-light text-4xl sm:text-5xl leading-tight">{t("about.values_label")}</h2>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-x-10 gap-y-12">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="w-12 h-12 rounded-full border border-[#111827]/15 flex items-center justify-center mb-5">
                <v.icon className="w-5 h-5 text-[#16A34A]" />
              </div>
              <h3 className="font-display text-2xl mb-3">{v.title}</h3>
              <p className="text-[#111827]/60 font-light leading-relaxed">{v.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-[#111827]/10">
        <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="font-display font-light text-4xl sm:text-5xl">{t("about.cta_title")}</h2>
            <p className="mt-4 text-[#111827]/55 font-light">{t("about.cta_body")}</p>
            <Link
              to="/products"
              style={{ "--sweep": "#16A34A" }}
              className="btn-sweep group mt-9 inline-flex items-center gap-3 bg-[#111827] text-white px-8 py-4 text-sm uppercase tracking-[0.15em]"
            >
              {t("about.cta_btn")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
