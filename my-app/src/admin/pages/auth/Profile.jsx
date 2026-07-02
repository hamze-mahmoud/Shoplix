import { useTranslation } from "react-i18next";
import { useAuth } from "../../../shared/hooks/useAuth";

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return <p>{t("admin.common.loading")}</p>;

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">{t("admin.auth.profile_title")}</h1>

      <div className="bg-white p-4 rounded shadow space-y-2">

        <p>
          <strong>{t("admin.users.col_name")}:</strong>{" "}
          {user.firstName} {user.lastName}
        </p>

        <p>
          <strong>{t("admin.users.col_email")}:</strong> {user.email}
        </p>

        <p>
          <strong>{t("admin.users.col_role")}:</strong> {t(`admin.users.role_${user.role}`, user.role)}
        </p>

      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {t("admin.logout")}
      </button>

    </div>
  );
}