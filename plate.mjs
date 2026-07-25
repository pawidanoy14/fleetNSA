// Thai plate numbers get entered inconsistently across systems, e.g.
// "นข-7138", "นข 7138", "นข7138" all refer to the same vehicle.
// normalizePlate() strips whitespace/dashes so records from GPS, Kissflow,
// and the driver registry can be joined reliably.
export function normalizePlate(raw) {
  if (raw == null) return "";
  return String(raw)
    .replace(/[\s\-–—]/g, "")
    .trim()
    .toUpperCase();
}

// Team codes appear as "SMA 6" in the driver registry/nicknames and as
// "NSA6" in Kissflow's Region Code + the ops team's dashboard sheets.
// Both encode the same team number; extractTeamNumber() pulls it out so
// the two naming schemes can be matched.
export function extractTeamNumber(raw) {
  if (raw == null) return null;
  const m = String(raw).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export function teamKeyFromNumber(n) {
  return `NSA${n}`;
}
