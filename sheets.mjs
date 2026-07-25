// Fetch a single named tab from a public Google Sheet as parsed rows (array of arrays).
// Uses the Google Visualization "gviz" CSV export, which (unlike /export?format=csv&gid=)
// lets you select a tab by its NAME instead of guessing its numeric gid, and tolerates
// tabs being reordered/renamed-around. The spreadsheet must be shared as
// "Anyone with the link can view".
import Papa from "papaparse";

const CACHE = new Map(); // key -> { at: timestamp, rows: [][] }
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — avoid hammering Sheets on every page view

export function gvizUrl(spreadsheetId, sheetName) {
  const base = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`;
  const params = new URLSearchParams({ tqx: "out:csv", sheet: sheetName });
  return `${base}?${params.toString()}`;
}

export async function fetchSheetRows(spreadsheetId, sheetName, { ttlMs = CACHE_TTL_MS } = {}) {
  const key = `${spreadsheetId}::${sheetName}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.at < ttlMs) return cached.rows;

  const url = gvizUrl(spreadsheetId, sheetName);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch sheet "${sheetName}" (${spreadsheetId}): HTTP ${res.status}. ` +
      `Make sure the spreadsheet is shared as "Anyone with the link can view".`
    );
  }
  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(
      `Sheet "${sheetName}" (${spreadsheetId}) returned empty content — check the tab name ` +
      `is spelled exactly right and the file is shared publicly.`
    );
  }
  const parsed = Papa.parse(text, { skipEmptyLines: false });
  const rows = parsed.data;
  CACHE.set(key, { at: Date.now(), rows });
  return rows;
}

// Convenience: rows -> array of objects using the first row as header.
export function rowsToObjects(rows) {
  if (!rows || !rows.length) return [];
  const header = rows[0].map((h) => (h || "").toString().trim());
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c) => c === "" || c == null)) continue;
    const obj = {};
    header.forEach((h, idx) => {
      if (h) obj[h] = r[idx];
    });
    out.push(obj);
  }
  return out;
}
