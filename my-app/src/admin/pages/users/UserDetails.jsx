import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../Shared/services/api";
import { userService } from "../../../Shared/services/userService";

export default function UserDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then((res) => setUser(res.data));
  }, [id]);

  if (!user) return <p>{t("admin.common.loading")}</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}