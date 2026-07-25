"use client";
import { useMemo, useState } from "react";
import StatusBadge from "./StatusBadge";
import { fmtInt, fmtMoney } from "../lib/format.mjs";

const COLS = [
  { key: "team", label: "ทีม" },
  { key: "nickname", label: "คนขับ" },
  { key: "gpsKm", label: "GPS (กม.)" },
  { key: "kissflowKm", label: "Kissflow (กม.)" },
  { key: "ratioPct", label: "% กรอก" },
  { key: "kissflowExpense", label: "ค่าใช้จ่าย" },
  { key: "afterHoursThisMonth", label: "นอกเวลา" },
  { key: "missingDaysThisMonth", label: "กรอกขาด" },
  { key: "status", label: "สถานะ" },
];

export default function TeamsView({ data }) {
  const [sortKey, setSortKey] = useState("ratioPct");
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let r = data.teamRows.filter((row) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return `${row.team} ${row.nickname || ""} ${row.driverName || ""} ${row.plate || ""}`
        .toLowerCase()
        .includes(q);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    r.sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === "string") return x.localeCompare(y) * dir;
      return (x - y) * dir;
    });
    return r;
  }, [data.teamRows, sortKey, sortDir, search]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="ค้นหาทีม / คนขับ / ทะเบียน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: "1px solid #ddd7cb", borderRadius: 9, padding: "8px 12px", fontSize: 13,
            width: 280, maxWidth: "100%",
          }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team}>
                <td>{r.team}{!r.hasRegistryEntry ? " *" : ""}</td>
                <td>{r.nickname || "-"}</td>
                <td>{r.gpsKm != null ? fmtInt(r.gpsKm) : "-"}</td>
                <td>{r.kissflowKm != null ? fmtInt(r.kissflowKm) : "-"}</td>
                <td>{r.ratioPct != null ? `${r.ratioPct}%` : "-"}</td>
                <td>{r.kissflowExpense != null ? fmtMoney(r.kissflowExpense) : "-"}</td>
                <td>{fmtInt(r.afterHoursThisMonth)}</td>
                <td>{r.missingDaysThisMonth ?? "-"}</td>
                <td><StatusBadge kind={r.statusKind} label={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
        * ทีมที่ยังไม่มีข้อมูลในทะเบียนคนขับ (พบเฉพาะในระบบติดตามการกรอก Kissflow)
      </div>
    </div>
  );
}
