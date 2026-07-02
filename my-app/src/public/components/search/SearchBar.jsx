import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    navigate(`/search?q=${keyword}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      
      {/* Icon */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition" />

      {/* Input */}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search for products, brands, categories..."
        className="
          w-full
          pl-12 pr-4 py-3
          rounded-full
          bg-gray-100/80
          border border-transparent
          focus:border-green-400
          focus:bg-white
          focus:ring-2 focus:ring-green-200
          outline-none
          transition-all duration-300
          shadow-sm
          hover:shadow-md
        "
      />
    </form>
  );
}