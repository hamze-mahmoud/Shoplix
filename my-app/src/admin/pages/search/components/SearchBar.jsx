import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../../Shared/hooks/useDebounce";
import { searchService } from "../../../../Shared/services/searchService";

export default function SearchBar({ onSearch }) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");
  const debounced = useDebounce(keyword, 400);

  const [suggestions, setSuggestions] = useState([]);

  // 🔥 autocomplete
  useEffect(() => {
    if (!debounced) return;

    searchService.autocomplete(debounced)
      .then((res) => setSuggestions(res.data))
      .catch(console.error);

  }, [debounced]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword });
  };

  return (
    <div className="relative">

      <form onSubmit={handleSubmit}>
        <input
          className="border p-2 w-full"
          placeholder={t("admin.search.placeholder")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>

      {/* 🔥 Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute bg-white border w-full shadow mt-1 z-10">

          {suggestions.map((s) => (
            <div
              key={s._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setKeyword(s.name);
                setSuggestions([]);
                onSearch({ keyword: s.name });
              }}
            >
              {s.name}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}