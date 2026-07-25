// Parses the ops team's existing monthly "SMA Team Dashboard" tabs (e.g. "กค.69").
// These tabs are NOT plain rectangular tables — they stack several sections
// vertically in one very wide sheet (300+ columns, mostly blank), with headers
// that don't always line up with the data below them (the ops team's own bug
// report: broken/renamed header cells). Rather than trust column position or
// header text, we read each row's non-empty cells IN ORDER ("compact" form).
// That turns out to be a stable, position-independent signature per section:
//   team summary row      -> [team, totalMissing, monthMissing, weeklyDelta, cost]
//   employee summary row  -> [name, totalMissing, monthMissing]
//   team missing-dates row-> [team, "22, 23, 24"]
//   employee missing-dates-> [name, "22, 23, 24"]
function compact(row) {
  return (row || [])
    .map((c) => (c == null ? "" : String(c).trim()))
    .filter((c) => c !== "");
}

function parseNumber(str) {
  if (str == null) return 0;
  const n = parseFloat(String(str).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseDateList(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

const isTeamCode = (s) => /^NSA\d+$/i.test(s);

export function parseMonthlyDashboardTab(rows) {
  const DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  let updatedAt = null;
  for (const r of rows) {
    const found = compact(r).find((c) => DATE_RE.test(c));
    if (found) { updatedAt = found; break; }
  }

  const teamSummary = [];
  const employeeSummary = [];
  const teamMissingDates = [];
  const employeeMissingDates = [];

  let i = 0;
  // 1) SMA team summary block: starts after a row whose first compact cell is "ทีม"
  while (i < rows.length && compact(rows[i])[0] !== "ทีม") i++;
  i++; // skip header
  while (i < rows.length) {
    const c = compact(rows[i]);
    if (!isTeamCode(c[0])) break;
    teamSummary.push({
      team: c[0].toUpperCase(),
      totalMissing: parseNumber(c[1]),
      monthMissing: parseNumber(c[2]),
      weeklyDelta: parseNumber(c[3]),
      costImpact: parseNumber(c[4]),
    });
    i++;
  }

  // 2) Employee ("Area") summary block: next row whose first cell is "ชื่อพนักงาน"
  while (i < rows.length && compact(rows[i])[0] !== "ชื่อพนักงาน") i++;
  i++;
  while (i < rows.length) {
    const c = compact(rows[i]);
    if (c.length < 2 || c[0].startsWith("Detailed Missing Dates") || c[0] === "ทีม") break;
    employeeSummary.push({
      name: c[0],
      totalMissing: parseNumber(c[1]),
      monthMissing: parseNumber(c[2] ?? c[1]),
    });
    i++;
  }

  // 3) "Detailed Missing Dates - SMA" block
  while (i < rows.length && compact(rows[i])[0] !== "Detailed Missing Dates - SMA") i++;
  i++; // section title
  while (i < rows.length && compact(rows[i])[0] !== "ทีม") i++;
  i++; // header
  while (i < rows.length) {
    const c = compact(rows[i]);
    if (!isTeamCode(c[0])) break;
    teamMissingDates.push({ team: c[0].toUpperCase(), dates: parseDateList(c[1]) });
    i++;
  }

  // 4) "Detailed Missing Dates - Area" block
  while (i < rows.length && compact(rows[i])[0] !== "Detailed Missing Dates - Area") i++;
  i++;
  while (i < rows.length && compact(rows[i])[0] !== "ชื่อพนักงาน") i++;
  i++;
  while (i < rows.length) {
    const c = compact(rows[i]);
    if (c.length < 2) break;
    employeeMissingDates.push({ name: c[0], dates: parseDateList(c[1]) });
    i++;
  }

  return { updatedAt, teamSummary, employeeSummary, teamMissingDates, employeeMissingDates };
}
