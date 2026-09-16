/** "2026-09-16" -> "16 Sep 2026" (parsed as a plain calendar date, no timezone shift). */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Local calendar date as YYYY-MM-DD - the same day the backend compares against. */
export function today() {
  return new Date().toLocaleDateString("en-CA");
}
