import { useState } from "react";
import { Link } from "react-router-dom";

export default function CategoryNode({ node }) {
  const [open, setOpen] = useState(false);
console.log("node ",node)
  return (
    <div className="ml-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-blue-500"
        onClick={() => setOpen(!open)}
      >
        {node.children?.length > 0 && (
          <span>{open ? "▼" : "▶"}</span>
        )}
        <Link to={`/admin/category/${node._id}`}>{node.name}</Link>
      </div>

      {open && node.children && (
        <div className="ml-4">
          {node.children.map((child) => (
            <CategoryNode key={child._id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}