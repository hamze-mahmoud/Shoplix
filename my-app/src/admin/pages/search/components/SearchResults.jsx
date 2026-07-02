import { useTranslation } from "react-i18next";

export default function SearchResults({ data, loading }) {
  const { t } = useTranslation();

  if (loading) return <p>{t("admin.common.loading")}</p>;

  if (!data.length) return <p>{t("admin.search.no_results")}</p>;

  return (
    <div className="bg-white shadow rounded">

      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">{t("admin.users.col_name")}</th>
            <th className="p-2">{t("admin.products.col_variants")}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((p) => (
            <tr key={p._id} className="border-b">

              <td className="p-2">{p.name}</td>

              <td className="p-2">
                {p.variants?.length || 0}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}