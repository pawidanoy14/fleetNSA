import { NextResponse } from "next/server";
import { getDashboardData } from "../../../lib/pipeline.mjs";

export const dynamic = "force-dynamic"; // always re-check the 5-min in-memory cache

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || undefined;
  try {
    const data = await getDashboardData({ month });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 502 }
    );
  }
}
