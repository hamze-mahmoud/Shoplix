import { useEffect, useState } from "react";
import { categoryService } from "../../../services/categoryService";

export default function CategorySelector({ onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data);
    });
  }, []);

  const renderTree = (cats, parent = null) =>
    cats
      .filter((c) => c.parent === parent)
      .map((c) => (
        <div key={c._id} className="ml-4">

          <label className="flex gap-2">
            <input
              type="radio"
              name="category"
              onChange={() => onChange(c._id)}
            />
            {c.name}
          </label>

          {renderTree(cats, c._id)}
        </div>
      ));

  return <div>{renderTree(categories)}</div>;
}