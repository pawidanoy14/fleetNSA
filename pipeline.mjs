import { fetchSheetRows, rowsToObjects } from "./sheets.mjs";
import { normalizePlate, extractTeamNumber } from "./plate.mjs";
import { parseDMY, monthKey, thaiMonthLabel } from "./dates.mjs";
import { parseMonthlyDashboardTab } from "./monthlyDashboard.mjs";
import {
  GPS_SHEET_ID,
  KISSFLOW_SHEET_ID,
  TAB_GPS_ACTIVITY,
  TAB_AFTER_HOURS,
  TAB_DRIVER_REGISTRY,
  TAB_KISSFLOW_DUMP,
  MONTHLY_DASHBOARD_TABS,
} from "./config.mjs";

function num(v) {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ---- Driver registry: ทะเบียน / รหัสพนักงาน / ชื่อผู้ขับ / ทีม / ชื่อทีม ----
async function loadDriverRegistry() {
  const rows = await fetchSheetRows(GPS_SHEET_ID, TAB_DRIVER_REGISTRY);
  const objs = rowsToObjects(rows);
  const byPlate = new Map();
  const byTeamNum = new Map();
  for (const o of objs) {
    const plateNorm = normalizePlate(o["ทะเบียน"]);
    if (!plateNorm) continue;
    const teamNum = extractTeamNumber(o["ทีม"]);
    const entry = {
      plate: o["ทะเบียน"],
      plateNorm,
      empId: o["รหัสพนักงาน"] || "",
      driverName: o["ชื่อผู้ขับ"] || "",
      team: o["ทีม"] || "",
      teamNum,
      nickname: o["ชื่อทีม"] || "",
    };
    byPlate.set(plateNorm, entry);
    if (teamNum != null) byTeamNum.set(teamNum, entry);
  }
  return { byPlate, byTeamNum };
}

// ---- GPS activity: ชื่อรถ / วันที่เริ่มบันทึก / ... / ระยะทาง (กิโลเมตร) / ประมาณการใช้เชื้อเพลิงรวม (ลิตร) ----
async function loadGpsActivity() {
  const rows = await fetchSheetRows(GPS_SHEET_ID, TAB_GPS_ACTIVITY);
  const objs = rowsToObjects(rows);
  // key: `${plateNorm}::${monthKey}` -> { km, fuelL, days:Set }
  const byPlateMonth = new Map();
  for (const o of objs) {
    const plateNorm = normalizePlate(o["ชื่อรถ"]);
    const d = parseDMY(o["วันที่เริ่มบันทึก"]);
    if (!plateNorm || !d) continue;
    const mk = monthKey(d);
    const k = `${plateNorm}::${mk}`;
    const cur = byPlateMonth.get(k) || { km: 0, fuelL: 0, days: new Set() };
    cur.km += num(o["ระยะทาง (กิโลเมตร)"]);
    cur.fuelL += num(o["ประมาณการใช้เชื้อเพลิงรวม (ลิตร)"]);
    cur.days.add(d.d);
    byPlateMonth.set(k, cur);
  }
  return byPlateMonth;
}

// ---- After-hours (>22:00): ชื่อรถ / วันที่.. / เวลา.. / ความเร็วสูงสุด / ตำบล / อำเภอ / จังหวัด / ละติจูด / ลองจิจูด ----
async function loadAfterHours() {
  const rows = await fetchSheetRows(GPS_SHEET_ID, TAB_AFTER_HOURS);
  const objs = rowsToObjects(rows);
  const byPlateMonth = new Map(); // count per plate per month
  const events = []; // flat list for map + ranking
  for (const o of objs) {
    const plateNorm = normalizePlate(o["ชื่อรถ"]);
    const d = parseDMY(o["วันที่เริ่มบันทึก"]);
    if (!plateNorm || !d) continue;
    const mk = monthKey(d);
    const k = `${plateNorm}::${mk}`;
    byPlateMonth.set(k, (byPlateMonth.get(k) || 0) + 1);
    const lat = parseFloat(o["ละติจูด"]);
    const lng = parseFloat(o["ลองจิจูด"]);
    events.push({
      plateNorm,
      monthKey: mk,
      date: `${d.d}/${d.m}/${d.y}`,
      time: o["เวลาเริ่มบันทึก"] || "",
      subdistrict: o["ตำบล"] || "",
      district: o["อำเภอ"] || "",
      province: o["จังหวัด"] || "",
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      reason: o["เหตุผลการใช้รถ"] || "",
    });
  }
  return { byPlateMonth, events };
}

// ---- Kissflow raw submissions: Region Code / หมายเลขทะเบียนรถ / ...ระยะทางที่เกิดขึ้น / น้ำมันที่ใช้(ลิตร) / ค่าใช้จ่ายที่เกิด ----
async function loadKissflowDump() {
  const rows = await fetchSheetRows(KISSFLOW_SHEET_ID, TAB_KISSFLOW_DUMP);
  const objs = rowsToObjects(rows);
  const byPlateMonth = new Map();
  const byTeamMonth = new Map();
  for (const o of objs) {
    const d = parseDMY(o["วันที่ปฏิบัติงาน"]);
    if (!d) continue;
    const mk = monthKey(d);
    // Prefer the replacement plate if the employee actually drove a substitute vehicle.
    const rawPlate = o["หมายเลขทะเบียนรถทดแทน"] || o["หมายเลขทะเบียนรถ"];
    const plateNorm = normalizePlate(rawPlate);
    const teamNum = extractTeamNumber(o["Region Code"]);
    const dist = num(o["Task Detail Table.ระยะทางที่เกิดขึ้น"] ?? o["ระยะทางที่เกิดขึ้น"]);
    const fuel = num(o["น้ำมันที่ใช้(ลิตร)"]);
    const expense = num(o["ค่าใช้จ่ายที่เกิด"]);

    if (plateNorm) {
      const k = `${plateNorm}::${mk}`;
      const cur = byPlateMonth.get(k) || { km: 0, fuelL: 0, expense: 0, entries: 0 };
      cur.km += dist;
      cur.fuelL += fuel;
      cur.expense += expense;
      cur.entries += 1;
      byPlateMonth.set(k, cur);
    }
    if (teamNum != null) {
      const tk = `NSA${teamNum}::${mk}`;
      const cur = byTeamMonth.get(tk) || { km: 0, fuelL: 0, expense: 0, entries: 0 };
      cur.km += dist;
      cur.fuelL += fuel;
      cur.expense += expense;
      cur.entries += 1;
      byTeamMonth.set(tk, cur);
    }
  }
  return { byPlateMonth, byTeamMonth };
}

// ---- All monthly "SMA Team Dashboard" tabs, keyed by their Thai label e.g. "ก.ค. 69" ----
async function loadAllMonthlyDashboards() {
  const out = {};
  for (const { key, tab } of MONTHLY_DASHBOARD_TABS) {
    try {
      const rows = await fetchSheetRows(KISSFLOW_SHEET_ID, tab);
      out[key] = parseMonthlyDashboardTab(rows);
    } catch (err) {
      out[key] = { error: String(err.message || err) };
    }
  }
  return out;
}

function statusOf(ratioPct) {
  if (ratioPct > 200) return { status: "GPS ผิดปกติ", kind: "bad" };
  if (ratioPct < 90) return { status: "กรอกขาด", kind: "warn" };
  if (ratioPct > 115) return { status: "เกินจริง", kind: "warn" };
  return { status: "ตรง", kind: "ok" };
}

// Builds the full dashboard dataset for one month label (e.g. "ก.ค. 69").
// Falls back to the most recent month with monthly-dashboard data if none given.
export async function getDashboardData({ month } = {}) {
  const [registry, gps, afterHours, kissflow, monthlyDashboards] = await Promise.all([
    loadDriverRegistry(),
    loadGpsActivity(),
    loadAfterHours(),
    loadKissflowDump(),
    loadAllMonthlyDashboards(),
  ]);

  const months = MONTHLY_DASHBOARD_TABS.map((m) => m.key);
  const selectedMonth = month && months.includes(month) ? month : months[months.length - 1];

  // Map the Thai label (e.g. "ก.ค. 69") back to a Gregorian {y,m} to look up GPS/Kissflow keys.
  const tabInfo = MONTHLY_DASHBOARD_TABS.find((m) => m.key === selectedMonth);
  const monthIndex = MONTHLY_DASHBOARD_TABS.indexOf(tabInfo);
  // Assume the tabs are in chronological order and derive the calendar month from "today"
  // minus offset from the last tab — simplest robust approach: parse from the dashboard's
  // own "updatedAt" for the *last* tab, then walk backwards.
  const dash = monthlyDashboards[selectedMonth] || {};

  // Build the set of all team codes we know about from any source.
  const teamCodes = new Set();
  (dash.teamSummary || []).forEach((t) => teamCodes.add(t.team));
  for (const [, entry] of registry.byTeamNum) teamCodes.add(`NSA${entry.teamNum}`);

  // We need a Gregorian month to key into GPS/Kissflow maps. Derive it from the dashboard's
  // updatedAt for the current tab when possible; otherwise fall back to matching by trying
  // all months present in the GPS data for each plate (best-effort).
  let ymGuess = null;
  if (dash.updatedAt) {
    const d = parseDMY(dash.updatedAt);
    if (d) ymGuess = { y: d.y, m: d.m };
  }
  // If this isn't the tab the "updatedAt" belongs to, shift by the offset between tabs.
  if (ymGuess) {
    const lastIdx = MONTHLY_DASHBOARD_TABS.length - 1;
    const shift = monthIndex - lastIdx;
    let mm = ymGuess.m + shift;
    let yy = ymGuess.y;
    while (mm < 1) { mm += 12; yy -= 1; }
    while (mm > 12) { mm -= 12; yy += 1; }
    ymGuess = { y: yy, m: mm };
  }
  const mk = ymGuess ? monthKey(ymGuess) : null;

  const teamRows = [...teamCodes].sort((a, b) => {
    const na = extractTeamNumber(a), nb = extractTeamNumber(b);
    return na - nb;
  }).map((team) => {
    const teamNum = extractTeamNumber(team);
    const reg = registry.byTeamNum.get(teamNum);
    const plateNorm = reg?.plateNorm;
    const gpsRow = mk && plateNorm ? gps.get(`${plateNorm}::${mk}`) : null;
    const kissRowByPlate = mk && plateNorm ? kissflow.byPlateMonth.get(`${plateNorm}::${mk}`) : null;
    const kissRowByTeam = mk ? kissflow.byTeamMonth.get(`${team}::${mk}`) : null;
    const kissRow = kissRowByPlate || kissRowByTeam;
    const ahCount = mk && plateNorm ? (afterHours.byPlateMonth.get(`${plateNorm}::${mk}`) || 0) : 0;

    const gpsKm = gpsRow?.km ?? null;
    const kissKm = kissRow?.km ?? null;
    const ratioPct = gpsKm && kissKm != null && gpsKm > 0 ? Math.round((kissKm / gpsKm) * 100) : null;
    const dashRow = (dash.teamSummary || []).find((t) => t.team === team);
    const dateRow = (dash.teamMissingDates || []).find((t) => t.team === team);
    const st = ratioPct != null ? statusOf(ratioPct) : { status: "ไม่มีข้อมูล GPS", kind: "unknown" };

    return {
      team,
      plate: reg?.plate || null,
      driverName: reg?.driverName || null,
      nickname: reg?.nickname || null,
      hasRegistryEntry: !!reg,
      gpsKm: gpsKm != null ? Math.round(gpsKm * 10) / 10 : null,
      kissflowKm: kissKm != null ? Math.round(kissKm * 10) / 10 : null,
      ratioPct,
      status: st.status,
      statusKind: st.kind,
      kissflowExpense: kissRow?.expense ?? null,
      kissflowFuelL: kissRow?.fuelL ?? null,
      afterHoursThisMonth: ahCount,
      missingDaysThisMonth: dashRow?.monthMissing ?? null,
      missingDaysTotal: dashRow?.totalMissing ?? null,
      costImpact: dashRow?.costImpact ?? null,
      missingDates: dateRow?.dates ?? [],
    };
  });

  // Overview KPIs
  const withGps = teamRows.filter((r) => r.gpsKm != null);
  const sumGps = withGps.reduce((s, r) => s + (r.gpsKm || 0), 0);
  const sumKiss = withGps.reduce((s, r) => s + (r.kissflowKm || 0), 0);
  const overallRatio = sumGps > 0 ? Math.round((sumKiss / sumGps) * 100) : null;
  const totalExpense = teamRows.reduce((s, r) => s + (r.kissflowExpense || 0), 0);
  const totalCostImpact = teamRows.reduce((s, r) => s + (r.costImpact || 0), 0);
  const totalAfterHours = teamRows.reduce((s, r) => s + (r.afterHoursThisMonth || 0), 0);
  const counts = { ok: 0, warn: 0, bad: 0, unknown: 0 };
  teamRows.forEach((r) => { counts[r.statusKind] = (counts[r.statusKind] || 0) + 1; });

  // Trend across all known months (uses whatever team-summary + join data is available per month)
  const trend = months.map((mLabel) => {
    const d = monthlyDashboards[mLabel] || {};
    const totalMissing = (d.teamSummary || []).reduce((s, t) => s + t.monthMissing, 0);
    const totalCost = (d.teamSummary || []).reduce((s, t) => s + t.costImpact, 0);
    return { month: mLabel, totalMissing, totalCost };
  });

  // After-hours ranking + map points for the selected month
  const ahEventsThisMonth = mk ? afterHours.events.filter((e) => e.monthKey === mk) : afterHours.events;
  const ahRanking = teamRows
    .map((r) => ({ team: r.team, nickname: r.nickname, plate: r.plate, count: r.afterHoursThisMonth }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    month: selectedMonth,
    months,
    generatedAt: new Date().toISOString(),
    kpis: {
      vehicleCount: teamRows.filter((r) => r.hasRegistryEntry).length,
      sumGpsKm: Math.round(sumGps),
      sumKissflowKm: Math.round(sumKiss),
      overallRatio,
      totalExpense: Math.round(totalExpense),
      totalCostImpact: Math.round(totalCostImpact * 100) / 100,
      totalAfterHours,
      statusCounts: counts,
    },
    teamRows,
    trend,
    afterHoursRanking: ahRanking,
    afterHoursEvents: ahEventsThisMonth,
    dashboardMeta: Object.fromEntries(months.map((mLabel) => [mLabel, { updatedAt: monthlyDashboards[mLabel]?.updatedAt, error: monthlyDashboards[mLabel]?.error }])),
  };
}
