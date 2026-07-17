import { useTranslation } from "react-i18next";
import { MessageCircle, Phone } from "lucide-react";

// "Need help?" contact block — WhatsApp chat (with a localized prefilled
// message) + phone call to the business number. Dropped into conversion
// points (cart summary, checkout) so a question doesn't become an abandon.
const BUSINESS_PHONE_INTL = "972593808251";

export default function WhatsAppHelp({ className = "" }) {
  const { t } = useTranslation();

  const waHref = `https://wa.me/${BUSINESS_PHONE_INTL}?text=${encodeURIComponent(
    t("help.prefill", "Hi Shoplix! I have a question about my order.")
  )}`;

  return (
    <div className={`pt-2 border-t border-gray-100 ${className}`}>
      <p className="text-xs text-gray-500 mb-2.5">{t("help.title", "Need help with your order?")}</p>
      <div className="flex gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          {t("help.whatsapp", "Chat on WhatsApp")}
        </a>
        <a
          href={`tel:+${BUSINESS_PHONE_INTL}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold hover:border-green-300 hover:text-green-700 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          {t("help.call", "Call us")}
        </a>
      </div>
    </div>
  );
}
