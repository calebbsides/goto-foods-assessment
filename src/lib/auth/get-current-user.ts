import { cookies } from "next/headers";
import { isFirebaseConfigured } from "@/lib/config";
import { getAuth } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import type { AuthUser } from "@/lib/auth/types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isFirebaseConfigured()) return null;
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  return getAuth().verifySession(session);
}
