// Locale-aware relative time ("5 minutes ago", "منذ ٥ دقائق", "לפני 5 דקות")
// using the built-in Intl.RelativeTimeFormat — no extra dependency.

const DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function timeAgo(date, locale = "en") {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  let duration = (new Date(date).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}
