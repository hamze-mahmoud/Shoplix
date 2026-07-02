import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../../Shared/services/api";

import TextField from "../../../components/forms/TextField";
import Button from "../../../components/ui/Button";

const initialState = {
  name: "",
  email: "",
  password: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export default function UserForm({ onSuccess }) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleChange = (e) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name,
      value: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/users", state);
    alert(t("admin.users.created"));

    dispatch({ type: "RESET" });
    onSuccess && onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">

      <TextField
        label={t("admin.users.col_name")}
        name="name"
        value={state.name}
        onChange={handleChange}
      />

      <TextField
        label={t("admin.users.col_email")}
        name="email"
        value={state.email}
        onChange={handleChange}
      />

      <TextField
        label={t("admin.users.password")}
        name="password"
        type="password"
        value={state.password}
        onChange={handleChange}
      />

      <Button type="submit">{t("admin.users.create")}</Button>

    </form>
  );
}