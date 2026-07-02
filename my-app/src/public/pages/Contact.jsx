import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toastService } from "../../Shared/services/toastService";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

import Reveal from "../../Shared/components/Reveal";

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // No backend mailer wired yet — simulate success + clear.
    setTimeout(() => {
      toastService.success(t("contact.form_success"));
      setForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 600);
  };

  const info = [
    { icon: Mail, label: t("contact.info_email_label"), value: "support@shoplix.com" },
    { icon: Phone, label: t("contact.info_phone_label"), value: "+970 123 456 789" },
    { icon: MapPin, label: t("contact.info_address_label"), value: t("contact.address") },
    { icon: Clock, label: t("contact.info_hours_label"), value: t("contact.hours") },
  ];

  const inputCls =
    "w-full bg-transparent border-b border-[#111827]/20 py-3 text-sm placeholder:text-[#111827]/40 focus:border-[#111827] outline-none transition-colors";

  return (
    <div className="bg-[#F8F9FA] text-[#111827] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* HEADER */}
        <Reveal className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-luxe text-[#16A34A] mb-4">{t("contact.label")}</p>
          <h1 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">{t("contact.title")}</h1>
          <p className="mt-6 text-[#111827]/60 font-light leading-relaxed text-lg">{t("contact.intro")}</p>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">

          {/* FORM */}
          <Reveal className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <input name="name" required value={form.name} onChange={handleChange} placeholder={t("contact.form_name")} className={inputCls} />
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder={t("contact.form_email")} className={inputCls} />
              </div>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder={t("contact.form_subject")} className={inputCls} />
              <textarea name="message" required rows={5} value={form.message} onChange={handleChange} placeholder={t("contact.form_message")} className={`${inputCls} resize-none`} />
              <button
                type="submit"
                disabled={sending}
                style={{ "--sweep": "#16A34A" }}
                className="btn-sweep group inline-flex items-center gap-3 bg-[#111827] text-white px-8 py-4 text-sm uppercase tracking-[0.15em] disabled:opacity-60"
              >
                {t("contact.form_send")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>
            </form>
          </Reveal>

          {/* INFO */}
          <Reveal x={30} className="lg:col-span-2 lg:border-s lg:border-[#111827]/10 lg:ps-12 space-y-10">
            {info.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-[#111827]/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#111827]/40">{item.label}</p>
                  <p className="mt-1 text-[#111827]/80">{item.value}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
