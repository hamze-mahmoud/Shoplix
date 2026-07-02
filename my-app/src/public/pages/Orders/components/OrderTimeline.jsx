import { ShoppingBag, CheckCircle2, Package, Truck, Bike, PackageCheck, XCircle, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const STEPS = [
  { key: "placed", icon: ShoppingBag },
  { key: "confirmed", icon: CheckCircle2 },
  { key: "preparing", icon: Package },
  { key: "shipped", icon: Truck },
  { key: "out_for_delivery", icon: Bike },
  { key: "delivered", icon: PackageCheck },
];

// Map legacy statuses onto the canonical lifecycle.
const LEGACY = { pending: "placed", paid: "confirmed", processing: "preparing" };
const normalize = (status) => LEGACY[status] || status;

export default function OrderTimeline({ status }) {
  const { t } = useTranslation();
  const normalized = normalize(status);

  if (normalized === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-700">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <p className="font-semibold">{t("orders.status_cancelled")}</p>
        </div>
      </div>
    );
  }

  const current = Math.max(0, STEPS.findIndex((s) => s.key === normalized));
  // Progress line fill: 0% at first step → 100% at last step
  const progress = (current / (STEPS.length - 1)) * 100;

  return (
    <div className="relative">
      {/* track */}
      <div className="absolute top-4 sm:top-5 start-4 end-4 h-1 rounded-full bg-gray-100" />
      {/* fill (grows from the start edge, RTL-aware) */}
      <div
        className="absolute top-4 sm:top-5 start-4 h-1 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all duration-700 ease-out"
        style={{ width: `${progress}%`, maxWidth: "calc(100% - 2rem)" }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 text-center w-12 sm:w-auto">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full ring-4 ring-white transition-all duration-500 ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-yellow-400 text-[#111827] shadow-lg shadow-yellow-200 scale-110"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? "animate-pulse" : ""}`} />}
              </div>
              <span
                className={`text-[10px] sm:text-xs leading-tight font-medium ${
                  done || active ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {t(`orders.status_${step.key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
