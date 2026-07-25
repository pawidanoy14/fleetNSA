import { fmtInt, fmtMoney } from "../lib/format.mjs";

export default function TrendsView({ data }) {
  const trend = data.trend;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="card">
        <div className="brand-font" style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          จำนวนวันกรอกขาด รายเดือน (รวมทุกทีม)
        </div>
        <SimpleChart points={trend.map((t) => ({ label: t.month, value: t.totalMissing }))} color="#E4002B" />
      </div>
      <div className="card">
        <div className="brand-font" style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          ผลกระทบทางการเงินจากการกรอกขาด รายเดือน (บาท)
        </div>
        <SimpleChart
          points={trend.map((t) => ({ label: t.month, value: t.totalCost }))}
          color="#F0A000"
          formatValue={fmtMoney}
        />
      </div>
    </div>
  );
}

function SimpleChart({ points, color, formatValue = fmtInt }) {
  const W = 640, H = 180, PAD = 28;
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? (W - PAD * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: PAD + i * step,
    y: H - PAD - (p.value / max) * (H - PAD * 2),
    ...p,
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 640, height: "auto" }}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e9e4da" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4" fill={color} />
          <text x={c.x} y={H - 6} fontSize="11" textAnchor="middle" fill="#8a8478">{c.label}</text>
          <text x={c.x} y={c.y - 10} fontSize="11" textAnchor="middle" fill="#1c1b18">{formatValue(c.value)}</text>
        </g>
      ))}
    </svg>
  );
}
