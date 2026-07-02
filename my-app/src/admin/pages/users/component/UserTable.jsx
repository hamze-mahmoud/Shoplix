import { useTranslation } from "react-i18next";

export default function UserTable({ users, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white shadow rounded">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th>{t("admin.users.col_id")}</th>
            <th>{t("admin.users.col_name")}</th>
            <th>{t("admin.users.col_email")}</th>
            <th>{t("admin.common.actions")}</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b">
              <td>{u._id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <button
                  onClick={() => onDelete(u._id)}
                  className="text-red-500"
                >
                  {t("admin.common.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}