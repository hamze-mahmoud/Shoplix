import { useRef } from "react";

export default function MultiImageUpload({
  images = [],
  onChange,
  max = 10,
}) {
  const inputRef = useRef(null);

  // 📤 Handle file selection
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    // limit max images
    const combined = [...images, ...files].slice(0, max);

    onChange(combined);

    // reset input so same file can be selected again
    e.target.value = "";
  };

  // ❌ remove image
  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* UPLOAD BUTTON */}
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFiles}
        />

        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          + Add Images
        </button>
      </div>

      {/* PREVIEW GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => {
            const url =
              img instanceof File
                ? URL.createObjectURL(img)
                : img;

            return (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt="variant"
                  className="w-full h-24 object-cover rounded-lg border"
                />

                {/* DELETE BUTTON */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}