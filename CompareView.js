import { fmtInt } from "../lib/format.mjs";

export default function CompareView({ data }) {
  const rows = data.teamRows.filter((r) => r.gpsKm != null || r.kissflowKm != null);
  const max = Math.max(1, ...rows.map((r) => Math.max(r.gpsKm || 0, r.kissflowKm || 0)));

  return (
    <div className="card">
      <div style={{ display: "flex", gap: 16, fontSize: 12.5, marginBottom: 14 }}>
        <Legend color="#0A5FB4" label="GPS (จริง)" />
        <Legend color="#FFC20E" label="Kissflow (กรอกเอง)" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r) => (
          <div key={r.team}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span>{r.team} {r.nickname ? `· ${r.nickname}` : ""}</span>
              <span style={{ color: "var(--muted)" }}>
                {r.ratioPct != null ? `${r.ratioPct}%` : "-"}
              </span>
            </div>
            <Bar value={r.gpsKm} max={max} color="#0A5FB4" label={fmtInt(r.gpsKm)} />
            <Bar value={r.kissflowKm} max={max} color="#FFC20E" label={fmtInt(r.kissflowKm)} />
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            ไม่มีข้อมูลที่ทั้ง GPS และ Kissflow ครบสำหรับเดือนนี้
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({ value, max, color, label }) {
  const pct = value != null ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
      <div style={{ flex: 1, height: 9, borderRadius: 5, background: "#efece4", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5 }} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", width: 60, textAlign: "right" }}>{label}</div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      {label}
    </div>
  );
}
