import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/firebase/admin";
import type { AuthProvider, AuthUser } from "@/lib/auth/types";

export function createFirebaseAuth(): AuthProvider {
  const auth = getAdminAuth(getAdminApp());

  return {
    async createSession(idToken, expiresInMs) {
      return auth.createSessionCookie(idToken, { expiresIn: expiresInMs });
    },
    async verifySession(sessionCookie) {
      try {
        const decoded = await auth.verifySessionCookie(sessionCookie, true);
        const user: AuthUser = {
          uid: decoded.uid,
          name: (decoded.name as string) ?? (decoded.email as string) ?? "Host",
          email: (decoded.email as string) ?? "",
        };
        return user;
      } catch {
        return null;
      }
    },
  };
}
