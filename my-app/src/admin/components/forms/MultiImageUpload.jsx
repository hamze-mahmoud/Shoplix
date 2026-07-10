import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, X } from "lucide-react";
import { enhanceProductImageStyles } from "./enhanceImage";

export default function MultiImageUpload({
  images = [],
  onChange,
  max = 10,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  // index currently being enhanced + model-download percent (null = processing)
  const [busyIndex, setBusyIndex] = useState(-1);
  const [progress, setProgress] = useState(null);
  // proposal = { index, beforeUrl, options:[{style,file,previewUrl}], selected } → style gallery
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);

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

  const urlOf = (img) => (img instanceof File ? URL.createObjectURL(img) : img);

  // ✨ AI enhance: remove background once, generate a gallery of designer
  // backdrops, and let the admin pick their favorite.
  const enhance = async (index) => {
    if (busyIndex !== -1) return;
    setError(null);
    setBusyIndex(index);
    setProgress(null);
    try {
      const source = images[index];
      const beforeUrl = urlOf(source);
      const { options } = await enhanceProductImageStyles(source, {
        onProgress: setProgress,
      });
      setProposal({ index, beforeUrl, options, selected: options[0]?.style });
    } catch (err) {
      console.error("Image enhancement failed:", err);
      setError(t("admin.products.enhance_failed", "Enhancement failed — try another image."));
    } finally {
      setBusyIndex(-1);
      setProgress(null);
    }
  };

  const acceptProposal = () => {
    if (!proposal) return;
    const chosen = proposal.options.find((o) => o.style === proposal.selected);
    if (!chosen) return;
    const updated = [...images];
    updated[proposal.index] = chosen.file;
    onChange(updated);
    setProposal(null);
  };

  const styleLabel = (key) =>
    t(`admin.products.style_${key}`, { pastel: "Soft Pastel", dark: "Luxury Dark", vivid: "Vivid Bold", creative: "Creative Shapes" }[key] || key);

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
          + {t("admin.products.add_images", "Add Images")}
        </button>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}

      {/* PREVIEW GRID */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => {
            const url = urlOf(img);
            const busy = busyIndex === index;

            return (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt="variant"
                  className="w-full h-24 object-cover rounded-lg border"
                />

                {/* BUSY OVERLAY */}
                {busy && (
                  <div className="absolute inset-0 rounded-lg bg-black/60 flex flex-col items-center justify-center gap-1 text-white text-[10px] font-medium px-1 text-center">
                    <Loader2 size={16} className="animate-spin" />
                    {progress !== null
                      ? t("admin.products.enhance_model", {
                          defaultValue: "AI model… {{percent}}%",
                          percent: progress,
                        })
                      : t("admin.products.enhance_working", "Enhancing…")}
                  </div>
                )}

                {/* ACTIONS */}
                {!busy && (
                  <>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title={t("admin.common.delete", "Delete")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => enhance(index)}
                      disabled={busyIndex !== -1}
                      title={t("admin.products.enhance_btn", "Enhance background (AI)")}
                      className="absolute bottom-1 right-1 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold rounded-md px-1.5 py-1 opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                    >
                      <Sparkles size={11} />
                      {t("admin.products.enhance_short", "Enhance")}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* STYLE GALLERY MODAL */}
      {proposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                {t("admin.products.enhance_title", "Background enhancement")}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("admin.products.enhance_pick", "Choose your favorite look — each backdrop is generated from the product's own colors.")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* original */}
              <div className="space-y-1">
                <img
                  src={proposal.beforeUrl}
                  alt="original"
                  className="w-full aspect-square object-contain rounded-xl border bg-gray-50"
                />
                <p className="text-[11px] font-semibold text-center uppercase tracking-wide text-gray-400">
                  {t("admin.products.enhance_original", "Original")}
                </p>
              </div>

              {/* style options */}
              {proposal.options.map((opt) => {
                const active = proposal.selected === opt.style;
                return (
                  <button
                    key={opt.style}
                    type="button"
                    onClick={() => setProposal({ ...proposal, selected: opt.style })}
                    className="space-y-1 text-left group/opt"
                  >
                    <img
                      src={opt.previewUrl}
                      alt={opt.style}
                      className={`w-full aspect-square object-cover rounded-xl border-2 transition ${
                        active
                          ? "border-indigo-600 ring-2 ring-indigo-200"
                          : "border-transparent group-hover/opt:border-indigo-300"
                      }`}
                    />
                    <p
                      className={`text-[11px] font-semibold text-center uppercase tracking-wide ${
                        active ? "text-indigo-600" : "text-gray-500"
                      }`}
                    >
                      {styleLabel(opt.style)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("admin.products.enhance_keep", "Keep original")}
              </button>
              <button
                type="button"
                onClick={acceptProposal}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                {t("admin.products.enhance_use", "Use enhanced")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
