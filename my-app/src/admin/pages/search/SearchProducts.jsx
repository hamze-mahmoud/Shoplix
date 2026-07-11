import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import { searchService } from "../../../Shared/services/searchService";

export default function SearchProducts() {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    try {
      setLoading(true);

      const res = await searchService.searchProducts(filters);
      setResults(res.data.products);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">{t("admin.search.title")}</h1>

      <SearchBar onSearch={handleSearch} />

      <SearchResults data={results} loading={loading} />

    </div>
  );
}