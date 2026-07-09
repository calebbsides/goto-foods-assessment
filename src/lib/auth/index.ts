import { createFirebaseAuth } from "@/lib/auth/providers/firebase";
import { createTestAuth } from "@/lib/auth/providers/test";
import type { AuthProvider } from "@/lib/auth/types";

let cached: AuthProvider | null = null;

export function getAuth(): AuthProvider {
  if (cached) return cached;
  cached = process.env.E2E_TEST_MODE === "1" ? createTestAuth() : createFirebaseAuth();
  return cached;
}
