export default function ProductPreview({ product }) {
  if (!product) return null;

  const variant = product.variants?.[0];

  return (
    <div className="border p-4 mt-6">

      <h2 className="text-xl font-bold">
        {product.name}
      </h2>

      <p>${variant?.price}</p>

      <div className="flex gap-2 mt-2">
        {variant?.images?.map((img, i) => (
          <img
            key={i}
            src={img}
            className="w-20 h-20 object-cover"
          />
        ))}
      </div>

    </div>
  );
}