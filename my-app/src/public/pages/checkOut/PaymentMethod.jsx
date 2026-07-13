import { useTranslation } from "react-i18next";
import { Truck } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", icon: Truck, labelKey: "cash_on_delivery", descKey: "cash_desc" },
];

const REGIONS = ["westBank", "jerusalem", "insidePalestine"];

export default function PaymentMethod({
  paymentMethod, setPaymentMethod,
  shippingAddress, setShippingAddress,
}) {
  const { t } = useTranslation();

  const handleAddress = (e) => setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });

  const inputCls = "w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white";

  return (
    <div className="space-y-4">

      {/* PAYMENT METHOD */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">{t("checkout.payment")}</h3>
        <div className="grid gap-3">
          {PAYMENT_METHODS.map(({ value, icon: Icon, labelKey, descKey }) => {
            const active = paymentMethod === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-start transition-all ${
                  active
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${active ? "text-green-700" : "text-gray-900"}`}>
                    {t(`checkout.${labelKey}`)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`checkout.${descKey}`)}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                  active ? "border-green-500 bg-green-500" : "border-gray-300"
                }`}>
                  {active && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DELIVERY INFORMATION */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">{t("checkout.delivery")}</h3>
        <div className="space-y-4">

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("checkout.region")}</label>
            <select
              name="region"
              value={shippingAddress.region}
              onChange={handleAddress}
              className={inputCls}
            >
              <option value="">{t("checkout.select_region")}</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{t(`checkout.${r}`)}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("checkout.city")}</label>
            <input
              type="text"
              name="city"
              value={shippingAddress.city}
              onChange={handleAddress}
              placeholder={t("checkout.city_placeholder")}
              className={inputCls}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("checkout.address")}</label>
            <textarea
              rows={3}
              name="description"
              value={shippingAddress.description}
              onChange={handleAddress}
              placeholder={t("checkout.address_placeholder")}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("checkout.phone")}</label>
            <input
              type="tel"
              name="phone"
              value={shippingAddress.phone}
              onChange={handleAddress}
              placeholder={t("checkout.phone_placeholder")}
              className={inputCls}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
