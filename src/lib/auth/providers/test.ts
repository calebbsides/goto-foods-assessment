import type { AuthProvider, AuthUser } from "@/lib/auth/types";

const PREFIX = "test:";

export function createTestAuth(): AuthProvider {
  return {
    async createSession(idToken) {
      return `${PREFIX}${idToken}`;
    },
    async verifySession(sessionCookie) {
      if (!sessionCookie.startsWith(PREFIX)) return null;
      try {
        const payload = JSON.parse(sessionCookie.slice(PREFIX.length)) as AuthUser;
        return payload;
      } catch {
        return null;
      }
    },
  };
}
