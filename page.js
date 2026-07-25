"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import OverviewView from "../components/OverviewView";
import TeamsView from "../components/TeamsView";
import CompareView from "../components/CompareView";
import TrendsView from "../components/TrendsView";
import AfterHoursView from "../components/AfterHoursView";

export default function Page() {
  const [view, setView] = useState("overview");
  const [month, setMonth] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = month ? `/api/data?month=${encodeURIComponent(month)}` : "/api/data";
    setError(null);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) { setError(json.error); return; }
        setData(json);
        if (!month) setMonth(json.month);
      })
      .catch((e) => setError(String(e)));
  }, [month]);

  return (
    <div id="appRoot" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar view={view} onNav={setView} meta={data ? { updatedAt: data.dashboardMeta?.[data.month]?.updatedAt } : null} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          view={view}
          month={month}
          months={data?.months || [month].filter(Boolean)}
          onMonth={setMonth}
          teamFilter={teamFilter}
          teams={data?.teamRows || []}
          onTeam={setTeamFilter}
        />
        <main style={{ padding: 24 }}>
          {error && (
            <div className="card" style={{ borderColor: "var(--bad-bd)", background: "var(--bad-bg)", color: "var(--bad-text)" }}>
              โหลดข้อมูลไม่สำเร็จ: {error}
              <div style={{ fontSize: 12, marginTop: 6 }}>
                ตรวจสอบว่า Google Sheet ทั้งสองไฟล์ตั้งค่าแชร์เป็น &quot;ทุกคนที่มีลิงก์ดูได้&quot; และชื่อแท็บถูกต้อง
              </div>
            </div>
          )}
          {!data && !error && <div style={{ color: "var(--muted)" }}>กำลังโหลดข้อมูล...</div>}
          {data && !error && (
            <>
              {view === "overview" && <OverviewView data={filterByTeam(data, teamFilter)} />}
              {view === "teams" && <TeamsView data={filterByTeam(data, teamFilter)} />}
              {view === "compare" && <CompareView data={filterByTeam(data, teamFilter)} />}
              {view === "trends" && <TrendsView data={data} />}
              {view === "afterhours" && <AfterHoursView data={filterByTeam(data, teamFilter)} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function filterByTeam(data, teamFilter) {
  if (teamFilter === "all") return data;
  return {
    ...data,
    teamRows: data.teamRows.filter((r) => r.team === teamFilter),
    afterHoursRanking: data.afterHoursRanking.filter((r) => r.team === teamFilter),
    afterHoursEvents: data.afterHoursEvents.filter((e) => {
      const row = data.teamRows.find((r) => r.team === teamFilter);
      return row && row.plate && e.plateNorm === row.plate.replace(/[\s-]/g, "").toUpperCase();
    }),
  };
}
