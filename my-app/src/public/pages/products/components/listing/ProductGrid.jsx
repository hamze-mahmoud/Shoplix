import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className="text-center text-gray-400 py-16">
        No products found
      </div>
    );
  }

  return (
    <div className="
      grid gap-6
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    ">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}