const NAV = [
  { id: "overview", label: "ภาพรวม" },
  { id: "teams", label: "รายคัน / ทีม" },
  { id: "compare", label: "เทียบ GPS · Kissflow" },
  { id: "trends", label: "แนวโน้ม" },
  { id: "afterhours", label: "ใช้รถนอกเวลา" },
];

export default function Sidebar({ view, onNav, meta }) {
  return (
    <aside
      id="sidebar"
      style={{
        width: 246, flexShrink: 0, background: "var(--sidebar-bg)", color: "var(--sidebar-fg)",
        display: "flex", flexDirection: "column", padding: "20px 14px",
        position: "sticky", top: 0, height: "100vh",
      }}
    >
      <div
        id="brandBox"
        style={{
          display: "flex", alignItems: "center", gap: 11, padding: "0 6px 18px", marginBottom: 6,
          borderBottom: "1px solid #2e2c27",
        }}
      >
        <div
          className="brand-font"
          style={{
            width: 40, height: 40, borderRadius: 11, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 19, color: "#1b1a17",
            boxShadow: "0 2px 0 var(--accent-shadow)",
          }}
        >
          Cjx
        </div>
        <div>
          <div className="brand-font" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>
            Fleet Dashboard
          </div>
          <div style={{ fontSize: 11, color: "var(--sidebar-muted)", marginTop: 2 }}>
            ระบบบริหารการใช้รถทีม SMA
          </div>
        </div>
      </div>

      <nav id="navList" style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 10 }}>
        {NAV.map((n) => {
          const active = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 10,
                border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 500,
                textAlign: "left", width: "100%",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#1b1a17" : "#b7b1a5",
              }}
            >
              <span className="navlabel">{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto", padding: "12px 8px 4px", borderTop: "1px solid #2e2c27",
          fontSize: 11, color: "#8b857b", lineHeight: 1.5,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E9E5B" }} />
          {meta?.updatedAt ? `ข้อมูลอัปเดต ${meta.updatedAt}` : "กำลังโหลด..."}
        </div>
        เชื่อมด้วยหมายเลขทะเบียนรถ
      </div>
    </aside>
  );
}
