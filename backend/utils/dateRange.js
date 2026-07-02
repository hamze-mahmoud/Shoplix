/**
 * Resolve a reporting period into a { start, end } window, plus the matching
 * "previous period" (same length, immediately before) for growth comparisons,
 * and a sensible default chart granularity.
 */
function getDateRange(period = "30d", from, to) {
  const now = new Date();
  const end = new Date(now);
  let start;
  let granularity = "day";

  switch (period) {
    case "today":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      granularity = "day";
      break;
    case "7d":
      start = new Date(now.getTime() - 7 * 86400000);
      granularity = "day";
      break;
    case "30d":
      start = new Date(now.getTime() - 30 * 86400000);
      granularity = "day";
      break;
    case "3m":
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      granularity = "week";
      break;
    case "year":
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      granularity = "month";
      break;
    case "custom": {
      start = from ? new Date(from) : new Date(now.getTime() - 30 * 86400000);
      const customEnd = to ? new Date(to) : new Date(now);
      customEnd.setHours(23, 59, 59, 999);
      const spanDays = (customEnd - start) / 86400000;
      granularity = spanDays > 180 ? "month" : spanDays > 60 ? "week" : "day";
      return { start, end: customEnd, granularity, ...prevPeriod(start, customEnd) };
    }
    default:
      start = new Date(now.getTime() - 30 * 86400000);
  }

  return { start, end, granularity, ...prevPeriod(start, end) };
}

function prevPeriod(start, end) {
  const ms = end - start;
  return {
    prevStart: new Date(start.getTime() - ms),
    prevEnd: new Date(start.getTime()),
  };
}

// % change with safe handling of a zero baseline
function growthPct(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

module.exports = { getDateRange, growthPct };
