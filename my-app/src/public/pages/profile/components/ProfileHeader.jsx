import { useTranslation } from "react-i18next";

// Presentational header. The parent (Profile) owns the user object and passes
// it down so edits saved in the form update the header instantly.
export default function ProfileHeader({ user }) {
  const { t } = useTranslation();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Phone-signup accounts get a synthesized @shoplix.local email — prefer the
  // phone as the subtitle, fall back to the email otherwise.
  const subtitle = user?.phone || user?.email;

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-[#16A34A] text-2xl font-bold text-white shadow-md">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-900 truncate">
          {fullName || t("profile.loading", "Loading…")}
        </h2>

        {subtitle && (
          <p dir="ltr" className="text-sm text-gray-500 truncate text-start">
            {subtitle}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            {t("profile.active_member", "Active Member")}
          </span>

          {user?.role && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
