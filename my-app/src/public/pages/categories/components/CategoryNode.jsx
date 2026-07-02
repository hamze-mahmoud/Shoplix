import { Link } from "react-router-dom";

export default function CategoryNode({
  category,
}) {
  return (
    <Link
      to={`/categories/${category._id}`}
      className="block border rounded-2xl p-4 hover:shadow-lg transition bg-gray-50"
    >
      <h3 className="font-semibold">
        {category.name}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {category.description}
      </p>
    </Link>
  );
}