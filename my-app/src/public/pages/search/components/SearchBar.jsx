import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../../Shared/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { searchService } from "../../../../Shared/services/searchService";

import AutoComplete from "./AutoComplete";

export default function SearchBar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef();
  const navigate = useNavigate();

  // 🔎 API
  useEffect(() => {
   if (!debouncedQuery) {
  setResults([]);
  setOpen(false);
  return;
}

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const { data } = await searchService.autocomplete(debouncedQuery);
        console.log("data from search ",data)
        setResults(data?.results || data || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // 🖱️ Outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ⌨️ Keyboard
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        handleSelect(results[activeIndex]);
      } else {
        handleSearch();
      }
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${query}`);
    setOpen(false);
  };

  const handleSelect = (item) => {
    setOpen(false);

    if (item._id) {
  navigate(`/products/${item._id}`);
} else {
      navigate(`/search?q=${item.name || query}`);
    }
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">

      {/* Input */}
      <div className="flex items-center bg-gray-50 border border-black/10 rounded-full px-4 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20">

        <Search className="w-4 h-4 text-gray-400 shrink-0" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length && setOpen(true)}
          placeholder={t("nav.search_placeholder")}
          className="bg-transparent outline-none px-3 w-full text-sm text-[#111827] placeholder:text-gray-400"
        />

        {query && (
          <button onClick={clearInput} aria-label="Clear search" className="shrink-0">
            <X className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors" />
          </button>
        )}
      </div>

      {/* 🔥 Extracted Component */}
      <AutoComplete
        open={open}
        loading={loading}
        results={results}
        query={query}
        activeIndex={activeIndex}
        onSelect={handleSelect}
        onSearch={handleSearch}
      />
    </div>
  );
}