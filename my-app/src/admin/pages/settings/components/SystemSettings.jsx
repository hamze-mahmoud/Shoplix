import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../../Shared/services/api";

export default function ProfileSettings() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.put("/users/profile", form);
    alert(t("admin.settings.profile_updated"));
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-semibold mb-4">{t("admin.settings.profile")}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder={t("admin.users.col_name")}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder={t("admin.users.col_email")}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          {t("admin.common.save")}
        </button>
      </form>
    </div>
  );
}