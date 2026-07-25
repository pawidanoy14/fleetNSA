import KpiCard from "./KpiCard";
import StatusBadge from "./StatusBadge";
import { fmtInt, fmtMoney } from "../lib/format.mjs";

export default function OverviewView({ data }) {
  const k = data.kpis;
  const issues = data.teamRows
    .filter((r) => r.statusKind === "bad" || r.statusKind === "warn" || (r.missingDaysThisMonth || 0) > 0)
    .sort((a, b) => (b.missingDaysThisMonth || 0) - (a.missingDaysThisMonth || 0))
    .slice(0, 8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard label="จำนวนรถ" value={fmtInt(k.vehicleCount)} sub="คัน" />
        <KpiCard label="ระยะทาง GPS" value={fmtInt(k.sumGpsKm)} sub="กม. (เดือนนี้)" />
        <KpiCard label="ระยะทาง Kissflow" value={fmtInt(k.sumKissflowKm)} sub="กม. (เดือนนี้)" />
        <KpiCard
          label="% ความตรงการกรอก"
          value={k.overallRatio != null ? `${k.overallRatio}%` : "-"}
          accent={k.overallRatio != null && (k.overallRatio < 90 || k.overallRatio > 115) ? "var(--warn-text)" : "var(--ok-text)"}
        />
        <KpiCard label="ค่าใช้จ่าย (Kissflow)" value={fmtInt(k.totalExpense)} sub="บาท" />
        <KpiCard label="ใช้รถนอกเวลา" value={fmtInt(k.totalAfterHours)} sub="ครั้ง (เดือนนี้)" />
        <KpiCard label="ผลกระทบจากกรอกขาด" value={fmtMoney(k.totalCostImpact)} sub="บาท (ประเมิน)" accent="var(--bad-text)" />
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 10 }}>
          <div className="brand-font" style={{ fontWeight: 700, fontSize: 15 }}>สถานะการกรอกข้อมูล</div>
          <div style={{ display: "flex", gap: 14, fontSize: 12.5 }}>
            <span><StatusBadge kind="ok" label={`ตรง ${k.statusCounts.ok || 0}`} /></span>
            <span><StatusBadge kind="warn" label={`ควรระวัง ${k.statusCounts.warn || 0}`} /></span>
            <span><StatusBadge kind="bad" label={`ต้องตรวจสอบ ${k.statusCounts.bad || 0}`} /></span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="brand-font" style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          ประเด็นที่ควรดู
        </div>
        {issues.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>ไม่มีประเด็นผิดปกติเดือนนี้</div>
        ) : (
          <table>
            <thead>
              <tr><th>ทีม</th><th>คนขับ</th><th>สถานะ</th><th>กรอกขาด (วัน)</th><th>ผลกระทบ (บาท)</th></tr>
            </thead>
            <tbody>
              {issues.map((r) => (
                <tr key={r.team}>
                  <td>{r.team}</td>
                  <td>{r.nickname || "-"}</td>
                  <td><StatusBadge kind={r.statusKind} label={r.status} /></td>
                  <td>{r.missingDaysThisMonth ?? "-"}</td>
                  <td>{r.costImpact != null ? fmtMoney(r.costImpact) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
