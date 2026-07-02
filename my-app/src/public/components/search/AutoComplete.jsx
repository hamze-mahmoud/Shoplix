import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { searchService } from "../../services/searchService";

export default function AutoComplete({ keyword, onSelect }) {
  const [results, setResults] = useState([]);

  const debounced = useDebounce(keyword, 300);

  useEffect(() => {
    if (!debounced) return;

    const fetchData = async () => {
      try {
        const res = await searchService.autocomplete(debounced);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [debounced]);

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow z-50">

      {results.map((item) => (
        <div
          key={item._id}
          onClick={() => onSelect(item.name)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          {item.name}
        </div>
      ))}

    </div>
  );
}