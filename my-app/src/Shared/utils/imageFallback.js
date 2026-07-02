// Guaranteed-valid high-quality fallback for any product/category image that
// fails to load (e.g. a remote host hiccup).
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85";

export const onImgError = (e) => {
  if (e?.currentTarget && e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};
