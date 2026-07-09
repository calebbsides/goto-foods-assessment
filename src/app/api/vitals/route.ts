import { NextResponse } from "next/server";
import { getLogger } from "@/lib/observability";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const metric = await request.json();
    getLogger().info("web_vitals", {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
