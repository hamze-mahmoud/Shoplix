import { useState, useEffect } from "react";

export function useVariantSelector(variants) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // 🔥 get available colors
  const colors = [...new Set(variants.map(v => v.color))];

  // 🔥 filter by color
  const filteredByColor = variants.filter(
    v => !selectedColor || v.color === selectedColor
  );

  // 🔥 available storage after color
  const storages = [...new Set(filteredByColor.map(v => v.storage))];

  // 🔥 select variant
  useEffect(() => {
    const found = variants.find(
      v =>
        v.color === selectedColor &&
        v.storage === selectedStorage
    );

    setSelectedVariant(found || null);
  }, [selectedColor, selectedStorage, variants]);

  // 🔥 default selection
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedColor(variants[0].color);
      setSelectedStorage(variants[0].storage);
    }
  }, [variants]);

  return {
    colors,
    storages,
    selectedColor,
    selectedStorage,
    selectedVariant,
    setSelectedColor,
    setSelectedStorage,
  };
}