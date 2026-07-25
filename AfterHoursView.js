"use client";
import { useEffect, useRef } from "react";
import { fmtInt } from "../lib/format.mjs";
import { normalizePlate } from "../lib/plate.mjs";

export default function AfterHoursView({ data }) {
  const iframeRef = useRef(null);
  const countByPlate = new Map(
    data.afterHoursRanking.map((r) => [normalizePlate(r.plate), r.count])
  );

  function postPoints() {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const points = data.afterHoursEvents
      .filter((e) => e.lat != null && e.lng != null)
      .map((e) => ({
        lat: e.lat, lng: e.lng, province: e.province, district: e.district,
        date: e.date, time: e.time, plate: e.plateNorm,
        count: countByPlate.get(e.plateNorm) || 1,
      }));
    win.postMessage({ type: "afterhours-points", points }, "*");
  }

  useEffect(() => {
    postPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="card" style={{ padding: 0, overflow: "hidden", height: 420 }}>
        <iframe
          ref={iframeRef}
          src="/map.html"
          onLoad={postPoints}
          title="After-hours map"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </div>
      <div className="card">
        <div className="brand-font" style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          อันดับการใช้รถนอกเวลา (เดือนนี้)
        </div>
        {data.afterHoursRanking.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>ไม่มีการใช้รถนอกเวลาในเดือนนี้</div>
        ) : (
          <table>
            <thead><tr><th>ทีม</th><th>คนขับ</th><th>ทะเบียน</th><th>จำนวนครั้ง</th></tr></thead>
            <tbody>
              {data.afterHoursRanking.map((r) => (
                <tr key={r.team}>
                  <td>{r.team}</td>
                  <td>{r.nickname || "-"}</td>
                  <td>{r.plate || "-"}</td>
                  <td>{fmtInt(r.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
