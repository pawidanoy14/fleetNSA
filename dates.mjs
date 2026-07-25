// Small date helpers shared by the pipeline. All source sheets use Thai/Gregorian
// day-first dates like "24/7/2026" (D/M/YYYY) — Thailand's standard business format.
const TH_MONTHS = [
  "", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function parseDMY(str) {
  if (!str) return null;
  const s = String(str).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  let [, d, mo, y] = m;
  d = parseInt(d, 10);
  mo = parseInt(mo, 10);
  y = parseInt(y, 10);
  if (y < 100) y += 2000; // just in case a 2-digit year ever shows up
  if (mo < 1 || mo > 12) return null;
  return { y, m: mo, d };
}

export function monthKey({ y, m }) {
  return `${y}-${String(m).padStart(2, "0")}`;
}

// e.g. {y:2026,m:7} -> "ก.ค. 69" (Buddhist-era 2-digit year, matches the sheets' own labels)
export function thaiMonthLabel({ y, m }) {
  const be = (y + 543) % 100;
  return `${TH_MONTHS[m]} ${String(be).padStart(2, "0")}`;
}
