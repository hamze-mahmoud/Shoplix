import { useTranslation } from "react-i18next";
import api from "../../../Shared/services/api";
import UserForm from "./components/UserForm";

export default function UserCreate() {
  const { t } = useTranslation();
  const handleCreate = async (data) => {
    await api.post("/users", data);
    alert(t("admin.users.created"));
  };

  return (
    <div>
      <h1>{t("admin.users.create")}</h1>
      <UserForm onSubmit={handleCreate} />
    </div>
  );
}