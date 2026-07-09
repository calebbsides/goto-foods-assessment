import { NextResponse } from "next/server";
import { getLogger } from "@/lib/observability";
import { MAX_VITALS_BODY_BYTES, vitalsSchema } from "@/app/api/vitals/schema";

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_VITALS_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  const raw = await request.text();
  if (raw.length > MAX_VITALS_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let parsed;
  try {
    parsed = vitalsSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if ("value" in parsed) {
    getLogger().info("web_vitals", {
      metric: parsed.name,
      value: parsed.value,
      rating: parsed.rating,
      id: parsed.id,
    });
  } else {
    getLogger().error("client.route_error", {
      message: parsed.message,
      digest: parsed.digest,
    });
  }

  return NextResponse.json({ ok: true });
}
