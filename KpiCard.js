export default function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ minWidth: 160, flex: "1 1 160px" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
      <div
        className="brand-font"
        style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: accent || "var(--text)" }}
      >
        {value}
      </div>
      {sub ? <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}
