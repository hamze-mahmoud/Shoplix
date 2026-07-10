// Turns a raw product photo into a premium studio shot:
// 1. in-browser AI background removal (@imgly/background-removal — free,
//    no API key; the model downloads once and is cached)
// 2. the product gets a light polish (saturation/contrast lift)
// 3. FOUR designer backdrops are generated from the product's own dominant
//    color — the admin picks their favorite in a gallery:
//      pastel   — soft adaptive gradient, spotlight, reflection
//      dark     — luxury black scene with a glowing color halo
//      vivid    — bold saturated gradient, floating accents
//      creative — podium disc, arcs and dots (designer look)

let removeBackgroundFn = null;

async function getRemover() {
  if (!removeBackgroundFn) {
    const mod = await import("@imgly/background-removal");
    removeBackgroundFn = mod.removeBackground;
  }
  return removeBackgroundFn;
}

const blobToImage = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

// Crop away fully transparent margins so the subject can be framed nicely.
function trimTransparent(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return c;
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(c, minX, minY, w, h, 0, 0, w, h);
  return out;
}

// ---- adaptive palette --------------------------------------------------

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

// Dominant saturated hue of the cut-out subject (or neutral fallback).
function subjectPalette(subject) {
  const s = 48;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  ctx.drawImage(subject, 0, 0, s, s);
  const { data } = ctx.getImageData(0, 0, s, s);

  const buckets = new Array(12).fill(0);
  const bucketSat = new Array(12).fill(0);
  const bucketHue = new Array(12).fill(0);
  let opaque = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    opaque++;
    const [h, sat, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (sat > 0.15 && l > 0.12 && l < 0.9) {
      const b = Math.floor(h / 30) % 12;
      buckets[b]++;
      bucketSat[b] += sat;
      bucketHue[b] += h;
    }
  }

  let best = 0;
  for (let i = 1; i < 12; i++) if (buckets[i] > buckets[best]) best = i;

  if (!opaque || buckets[best] < opaque * 0.04) {
    return { hue: 215, sat: 0.16, neutral: true };
  }
  return {
    hue: bucketHue[best] / buckets[best],
    sat: Math.min(0.5, (bucketSat[best] / buckets[best]) * 0.85),
    neutral: false,
  };
}

const hsl = (h, s, l, a = 1) =>
  `hsla(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}% / ${a})`;

// ---- shared drawing helpers ---------------------------------------------

const S = 1200; // output canvas size

function layoutSubject(subject, { bottom = 0.82, maxW = 0.74, maxH = 0.62 } = {}) {
  const scale = Math.min((S * maxW) / subject.width, (S * maxH) / subject.height);
  const w = subject.width * scale;
  const h = subject.height * scale;
  const x = (S - w) / 2;
  const yBottom = S * bottom;
  return { x, y: yBottom - h, w, h, yBottom };
}

// polish once — used for main draw + reflections
function polishSubject(subject) {
  const c = document.createElement("canvas");
  c.width = subject.width;
  c.height = subject.height;
  const ctx = c.getContext("2d");
  ctx.filter = "saturate(1.14) contrast(1.07) brightness(1.02)";
  ctx.drawImage(subject, 0, 0);
  return c;
}

function drawReflection(ctx, polished, { x, w, h, yBottom }, alphaTop = 0.35) {
  const reflH = Math.max(1, Math.min(h * 0.35, S - yBottom - 4));
  const refl = document.createElement("canvas");
  refl.width = Math.max(1, Math.round(w));
  refl.height = Math.round(reflH);
  const rctx = refl.getContext("2d");
  rctx.save();
  rctx.scale(1, -1);
  rctx.drawImage(polished, 0, -Math.round(h), refl.width, Math.round(h));
  rctx.restore();
  rctx.globalCompositeOperation = "destination-in";
  const mask = rctx.createLinearGradient(0, 0, 0, reflH);
  mask.addColorStop(0, `rgba(0,0,0,${alphaTop})`);
  mask.addColorStop(1, "rgba(0,0,0,0)");
  rctx.fillStyle = mask;
  rctx.fillRect(0, 0, refl.width, reflH);
  ctx.drawImage(refl, x, yBottom + 3, w, reflH);
}

function drawContactShadow(ctx, { w, yBottom }, color0, color1) {
  const shW = Math.max(w * 0.46, 90);
  const shH = Math.max(w * 0.07, 24);
  ctx.save();
  ctx.translate(S / 2, yBottom);
  ctx.scale(1, shH / shW);
  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, shW);
  sg.addColorStop(0, color0);
  sg.addColorStop(0.6, color1);
  sg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(0, 0, shW, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSubject(ctx, polished, { x, y, w, h }, shadowColor) {
  ctx.save();
  ctx.filter = `drop-shadow(0 ${Math.round(S * 0.012)}px ${Math.round(S * 0.025)}px ${shadowColor})`;
  ctx.drawImage(polished, x, y, w, h);
  ctx.restore();
}

function newCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  return [canvas, canvas.getContext("2d")];
}

// ---- the four styles -----------------------------------------------------

// Soft adaptive pastel — gradient, decor circle + ring, spotlight, reflection.
function stylePastel(subject, polished, pal) {
  const [canvas, ctx] = newCanvas();
  const { hue, sat } = pal;
  const L = layoutSubject(subject);

  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, hsl(hue, sat, 0.975));
  g.addColorStop(0.5, hsl(hue, sat, 0.93));
  g.addColorStop(1, hsl(hue, sat, 0.865));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  ctx.fillStyle = hsl(hue, sat, 0.82, 0.35);
  ctx.beginPath();
  ctx.arc(S * 0.84, S * 0.18, S * 0.30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = hsl(hue, sat, 0.68, 0.28);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(S * 0.14, S * 0.30, S * 0.17, 0, Math.PI * 2);
  ctx.stroke();

  const rg = ctx.createRadialGradient(S / 2, L.y + L.h * 0.4, 0, S / 2, L.y + L.h * 0.4, S * 0.62);
  rg.addColorStop(0, "rgba(255,255,255,0.78)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, S, S);

  const fg = ctx.createLinearGradient(0, L.yBottom, 0, S);
  fg.addColorStop(0, hsl(hue, sat, 0.84, 0.55));
  fg.addColorStop(1, hsl(hue, sat, 0.88, 0));
  ctx.fillStyle = fg;
  ctx.fillRect(0, L.yBottom, S, S - L.yBottom);

  drawReflection(ctx, polished, L, 0.35);
  drawContactShadow(ctx, L, hsl(hue, Math.min(sat + 0.1, 0.5), 0.18, 0.30), hsl(hue, sat, 0.25, 0.12));
  drawSubject(ctx, polished, L, hsl(hue, Math.min(sat + 0.1, 0.5), 0.22, 0.28));
  return canvas;
}

// Luxury dark — near-black vignette scene with a glowing color halo.
function styleDark(subject, polished, pal) {
  const [canvas, ctx] = newCanvas();
  const { hue, neutral } = pal;
  const sat = neutral ? 0.25 : Math.max(pal.sat, 0.35);
  const L = layoutSubject(subject, { bottom: 0.8 });

  const bg = ctx.createRadialGradient(S / 2, S * 0.42, S * 0.1, S / 2, S * 0.5, S * 0.85);
  bg.addColorStop(0, hsl(hue, sat * 0.5, 0.14));
  bg.addColorStop(0.6, hsl(hue, sat * 0.4, 0.09));
  bg.addColorStop(1, hsl(hue, sat * 0.35, 0.045));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // glowing halo behind the product
  const glow = ctx.createRadialGradient(S / 2, L.y + L.h * 0.45, 0, S / 2, L.y + L.h * 0.45, Math.max(L.w, L.h) * 0.8);
  glow.addColorStop(0, hsl(hue, Math.max(sat, 0.5), 0.5, 0.5));
  glow.addColorStop(0.55, hsl(hue, Math.max(sat, 0.5), 0.42, 0.16));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // fine horizon line on the floor
  ctx.strokeStyle = hsl(hue, sat, 0.6, 0.25);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(S * 0.12, L.yBottom + 2);
  ctx.lineTo(S * 0.88, L.yBottom + 2);
  ctx.stroke();

  drawReflection(ctx, polished, L, 0.45);
  drawContactShadow(ctx, L, "rgba(0,0,0,0.65)", "rgba(0,0,0,0.3)");
  drawSubject(ctx, polished, L, hsl(hue, Math.max(sat, 0.5), 0.45, 0.45));
  return canvas;
}

// Vivid bold — rich saturated duotone gradient with floating accents.
function styleVivid(subject, polished, pal) {
  const [canvas, ctx] = newCanvas();
  const { hue, neutral } = pal;
  const sat = neutral ? 0.5 : Math.max(pal.sat, 0.55);
  const L = layoutSubject(subject, { bottom: 0.83 });

  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, hsl(hue, sat, 0.66));
  g.addColorStop(1, hsl(hue + 35, sat, 0.5));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // floating soft circles
  const dots = [
    [0.14, 0.2, 0.055], [0.86, 0.14, 0.04], [0.78, 0.72, 0.05],
    [0.18, 0.78, 0.032], [0.92, 0.46, 0.026],
  ];
  for (const [dx, dy, dr] of dots) {
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.beginPath();
    ctx.arc(S * dx, S * dy, S * dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // bright stage behind the product so it stays readable
  const stage = ctx.createRadialGradient(S / 2, L.y + L.h * 0.45, 0, S / 2, L.y + L.h * 0.45, Math.max(L.w, L.h) * 0.75);
  stage.addColorStop(0, "rgba(255,255,255,0.85)");
  stage.addColorStop(0.7, "rgba(255,255,255,0.25)");
  stage.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = stage;
  ctx.fillRect(0, 0, S, S);

  drawReflection(ctx, polished, L, 0.28);
  drawContactShadow(ctx, L, hsl(hue, sat, 0.15, 0.4), hsl(hue, sat, 0.2, 0.16));
  drawSubject(ctx, polished, L, hsl(hue, sat, 0.15, 0.35));
  return canvas;
}

// Creative shapes — podium disc, arcs and dot grids (designer look).
function styleCreative(subject, polished, pal) {
  const [canvas, ctx] = newCanvas();
  const { hue, sat } = pal;
  const L = layoutSubject(subject, { bottom: 0.8, maxW: 0.68, maxH: 0.58 });

  ctx.fillStyle = hsl(hue, sat, 0.965);
  ctx.fillRect(0, 0, S, S);

  // podium disc behind the product
  const cy = L.y + L.h * 0.52;
  const pr = Math.max(L.w, L.h) * 0.62;
  ctx.fillStyle = hsl(hue, sat, 0.885);
  ctx.beginPath();
  ctx.arc(S / 2, cy, pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hsl(hue, sat, 0.78, 0.7);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(S / 2, cy, pr + 26, 0, Math.PI * 2);
  ctx.stroke();

  // arcs
  ctx.strokeStyle = hsl(hue, sat, 0.72, 0.55);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(S * 0.13, S * 0.16, S * 0.11, Math.PI * 0.9, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(S * 0.88, S * 0.86, S * 0.13, Math.PI * 1.9, Math.PI * 2.9);
  ctx.stroke();

  // dot grids
  const dotGrid = (ox, oy) => {
    ctx.fillStyle = hsl(hue, sat, 0.68, 0.6);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(ox + c * 30, oy + r * 30, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
  };
  dotGrid(S * 0.8, S * 0.24);
  dotGrid(S * 0.12, S * 0.68);

  drawContactShadow(ctx, L, hsl(hue, Math.min(sat + 0.1, 0.5), 0.2, 0.28), hsl(hue, sat, 0.25, 0.1));
  drawSubject(ctx, polished, L, hsl(hue, Math.min(sat + 0.1, 0.5), 0.25, 0.25));
  return canvas;
}

export const ENHANCE_STYLES = [
  { key: "pastel", render: stylePastel },
  { key: "dark", render: styleDark },
  { key: "vivid", render: styleVivid },
  { key: "creative", render: styleCreative },
];

// ---- main API ------------------------------------------------------------

const canvasToFile = (canvas, name) =>
  new Promise((resolve) =>
    canvas.toBlob(
      (blob) => resolve(new File([blob], name, { type: "image/jpeg" })),
      "image/jpeg",
      0.92
    )
  );

/**
 * Enhance a product image: remove its background (once), polish the product,
 * and generate a gallery of designer backdrops built from its own colors.
 *
 * @param {File|Blob|string} source  image file or URL
 * @param {{ onProgress?: (percent:number|null) => void }} opts
 * @returns {Promise<{options: Array<{style:string, file:File, previewUrl:string}>}>}
 */
export async function enhanceProductImageStyles(source, { onProgress } = {}) {
  const removeBackground = await getRemover();

  const cutout = await removeBackground(source, {
    output: { format: "image/png" },
    progress: (key, current, total) => {
      if (key?.startsWith("fetch") && total > 0) {
        onProgress?.(Math.min(99, Math.round((current / total) * 100)));
      } else {
        onProgress?.(null);
      }
    },
  });

  const img = await blobToImage(cutout);
  const subject = trimTransparent(img);
  const palette = subjectPalette(subject);
  const polished = polishSubject(subject);

  const baseName =
    typeof source === "object" && source?.name
      ? source.name.replace(/\.[^.]+$/, "")
      : "product";

  const options = [];
  for (const { key, render } of ENHANCE_STYLES) {
    const canvas = render(subject, polished, palette);
    const file = await canvasToFile(canvas, `${baseName}-${key}.jpg`);
    options.push({ style: key, file, previewUrl: URL.createObjectURL(file) });
  }
  return { options };
}
