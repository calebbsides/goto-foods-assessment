import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/cookies";

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.E2E_TEST_MODE !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const user = (await request.json()) as { uid: string; name: string; email: string };
  const sessionCookie = await getAuth().createSession(JSON.stringify(user), SESSION_MAX_AGE_MS);
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });
  return NextResponse.json({ ok: true });
}
