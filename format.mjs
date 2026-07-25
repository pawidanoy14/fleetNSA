export function fmtInt(n) {
  if (n == null || Number.isNaN(n)) return "-";
  return Math.round(n).toLocaleString("en-US");
}
export function fmtMoney(n) {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export const STATUS_STYLE = {
  ok: { text: "var(--ok-text)", bg: "var(--ok-bg)", bd: "var(--ok-bd)", dot: "var(--ok-dot)" },
  warn: { text: "var(--warn-text)", bg: "var(--warn-bg)", bd: "var(--warn-bd)", dot: "var(--warn-dot)" },
  bad: { text: "var(--bad-text)", bg: "var(--bad-bg)", bd: "var(--bad-bd)", dot: "var(--bad-dot)" },
  unknown: { text: "#6b6b6b", bg: "#eeeeee", bd: "#dddddd", dot: "#999999" },
};
