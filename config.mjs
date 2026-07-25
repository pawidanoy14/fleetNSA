// Google Sheet IDs. Override via env vars in production (Vercel project settings)
// so the deployed app isn't hard-coded to one company's spreadsheets.
export const GPS_SHEET_ID =
  process.env.GPS_SHEET_ID || "1bCUM8GESEqUSf0YfIf4liLrSZArW0PUSPuyCbq4_6PQ";
export const KISSFLOW_SHEET_ID =
  process.env.KISSFLOW_SHEET_ID || "14o2zNg2jY9CkP_1ej4Q9dN5xSXGFrR8m59kCPZVFeUg";

// Tab names inside GPS_SHEET_ID
export const TAB_GPS_ACTIVITY = "การใช้รถทีมกิจกรรม";
export const TAB_AFTER_HOURS = "ใช้รถเกิน 22.00";
export const TAB_DRIVER_REGISTRY = "รายชื่อคนขับ";

// Tab names inside KISSFLOW_SHEET_ID
export const TAB_KISSFLOW_DUMP = "ข้อมูลจาก Kissflow (Data Dump)";

// Monthly "SMA Team Dashboard" tabs (already computed by the ops team's sheet:
// missing-day counts + estimated cost impact + detailed missing dates,
// for both the SMA/team level and the Area/per-employee level).
// Add new months here as they're created in the sheet — no code changes needed.
export const MONTHLY_DASHBOARD_TABS = [
  { key: "พ.ค. 69", tab: "พค.69" },
  { key: "มิ.ย. 69", tab: "มิย.69" },
  { key: "ก.ค. 69", tab: "กค.69" },
];
