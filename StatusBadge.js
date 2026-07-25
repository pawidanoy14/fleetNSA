import { STATUS_STYLE } from "../lib/format.mjs";

export default function StatusBadge({ kind, label }) {
  const s = STATUS_STYLE[kind] || STATUS_STYLE.unknown;
  return (
    <span className="badge" style={{ color: s.text, background: s.bg, borderColor: s.bd }}>
      <span className="dot" style={{ background: s.dot }} />
      {label}
    </span>
  );
}
