import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { AuthUser } from "@/lib/auth/types";

export async function requireHost(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("unauthorized");
  }
  return user;
}
