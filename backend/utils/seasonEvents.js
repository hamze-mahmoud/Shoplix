// Season + holiday context for the recommendation engine, tuned for the
// Palestinian/Israeli market. Islamic dates (Ramadan/Eid) are computed with
// the built-in Intl islamic-umalqura calendar, so no lookup tables go stale.

// Extract hijri {month, day} for a date; null if ICU data is unavailable.
function hijriParts(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
    const get = (t) => Number(parts.find((p) => p.type === t)?.value);
    const month = get("month");
    const day = get("day");
    if (!month || !day) return null;
    return { month, day };
  } catch {
    return null;
  }
}

const inRange = (v, a, b) => v >= a && v <= b;

/**
 * Returns { season, events[], bucket } for a date.
 *  - season: winter | spring | summer | autumn
 *  - events: [{ key, name, weight, categories: RegExp, keywords: RegExp, audiences?: [] }]
 *  - bucket: string that changes every 6 hours — drives recommendation rotation.
 */
function getSeasonContext(date = new Date()) {
  const m = date.getMonth() + 1; // 1..12
  const d = date.getDate();

  const season =
    m === 12 || m <= 2 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "autumn";

  const events = [];
  const add = (key, name, weight, categories, keywords, audiences) =>
    events.push({ key, name, weight, categories, keywords, audiences });

  // --- Islamic events (dynamic via hijri calendar) ---
  const h = hijriParts(date);
  if (h) {
    if (h.month === 9) {
      add("ramadan", "Ramadan", 1.6, /appliance|juicer|blender|kitchen|furniture|table|dining/i, /juicer|blender|dining|table|kitchen|majlis|sofa/i);
    }
    if ((h.month === 10 && h.day <= 5) || (h.month === 9 && h.day >= 27)) {
      add("eid_fitr", "Eid al-Fitr", 1.8, /watch|wearable|audio|headphone|speaker|phone|electronics/i, /watch|headphone|speaker|phone|gift/i, ["kids", "young", "women", "men"]);
    }
    if (h.month === 12 && inRange(h.day, 8, 14)) {
      add("eid_adha", "Eid al-Adha", 1.8, /watch|wearable|audio|phone|electronics|appliance/i, /watch|headphone|phone|gift/i, ["kids", "young", "women", "men"]);
    }
  }

  // --- Fixed-date events ---
  if ((m === 12 && d >= 10) || (m === 1 && d <= 7)) {
    add("holidays", "Holiday season", 1.5, /electronics|phone|audio|wearable|watch/i, /gift|phone|watch|headphone|speaker/i);
  }
  if (m === 2 && inRange(d, 7, 14)) {
    add("valentine", "Valentine's Day", 1.4, /wearable|watch|audio|headphone/i, /watch|gift|headphone/i, ["women", "men", "young"]);
  }
  if (m === 3 && inRange(d, 14, 21)) {
    add("mothers_day", "Mother's Day", 1.6, /appliance|juicer|blender|kitchen|furniture/i, /juicer|blender|kitchen|home/i, ["women", "elderly"]);
  }
  if ((m === 8 && d >= 10) || (m === 9 && d <= 15)) {
    add("back_to_school", "Back to school", 1.5, /laptop|desk|electronics|computer/i, /laptop|desk|notebook|study|office/i, ["kids", "young"]);
  }

  // --- Season baseline ---
  if (season === "summer") {
    add("summer", "Summer picks", 1.25, /garden|outdoor|tent|patio|bench/i, /tent|garden|patio|outdoor|camping/i);
  } else if (season === "winter") {
    add("winter", "Winter picks", 1.2, /furniture|appliance|audio|kitchen/i, /sofa|table|blender|juicer|indoor|speaker|headphone/i);
  } else if (season === "spring") {
    add("spring", "Spring refresh", 1.15, /furniture|garden|outdoor/i, /garden|table|bench|patio/i);
  } else {
    add("autumn", "Autumn picks", 1.1, /furniture|desk|laptop/i, /desk|laptop|office|indoor/i);
  }

  // 6-hour rotation bucket, e.g. "2026-07-06:2"
  const bucket = `${date.toISOString().slice(0, 10)}:${Math.floor(date.getHours() / 6)}`;

  return { season, events, bucket };
}

module.exports = { getSeasonContext };
