import { useState } from "react";

export function useVariantBuilder(initial = []) {
  const [variants, setVariants] = useState(initial);

  // ➕ Add new variant
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color: "",
        storage: "",
        price: "",
        stock: "",
        images: [],
      },
    ]);
  };

  // ✏️ Update variant
  const updateVariant = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  // 🖼️ Add images
  const addImages = (index, files) => {
    const updated = [...variants];
    updated[index].images = [
      ...updated[index].images,
      ...Array.from(files),
    ];
    setVariants(updated);
  };

  // ❌ Remove variant
  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    variants,
    addVariant,
    updateVariant,
    removeVariant,
    addImages,
    setVariants,
  };
}