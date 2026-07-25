const TITLES = {
  overview: ["ภาพรวมการใช้รถ", "สรุป KPI และประเด็นที่ต้องดำเนินการ"],
  teams: ["รายคัน / รายทีม", "ตารางเรียง/กรอง/ค้นหาได้"],
  compare: ["เทียบ GPS กับ Kissflow", "ระยะทางจริงเทียบกับที่พนักงานกรอก"],
  trends: ["แนวโน้มตามเวลา", "ระยะทาง · ค่าเสียหาย · การกรอกขาด รายเดือน"],
  afterhours: ["การใช้รถนอกเวลา", "จุดพิกัดและอันดับการใช้รถหลัง 22:00 น."],
};

export default function Header({ view, month, months, onMonth, teamFilter, teams, onTeam }) {
  const [title, sub] = TITLES[view] || ["", ""];
  return (
    <header
      style={{
        background: "var(--card-bg)", borderBottom: "1px solid var(--border)", padding: "16px 26px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18,
        flexWrap: "wrap", position: "sticky", top: 0, zIndex: 30,
      }}
    >
      <div style={{ minWidth: 200 }}>
        <div className="brand-font" style={{ fontWeight: 700, fontSize: 21, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Field label="เดือน">
          <select value={month || ""} onChange={(e) => onMonth(e.target.value)} style={selectStyle}>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="ทีม">
          <select value={teamFilter} onChange={(e) => onTeam(e.target.value)} style={selectStyle}>
            <option value="all">ทุกทีม</option>
            {teams.map((t) => (
              <option key={t.team} value={t.team}>{t.nickname ? `${t.team} · ${t.nickname}` : t.team}</option>
            ))}
          </select>
        </Field>
      </div>
    </header>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

const selectStyle = {
  border: "1px solid #ddd7cb", background: "#fff", borderRadius: 9, padding: "8px 11px",
  fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", minWidth: 130,
};
