import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/cookies";
import { isFirebaseConfigured } from "@/lib/config";
import { getLogger } from "@/lib/observability";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  const { idToken } = (await request.json()) as { idToken?: string };
  if (!idToken) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }
  try {
    const sessionCookie = await getAuth().createSession(idToken, SESSION_MAX_AGE_MS);
    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    getLogger().error("session.create_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
