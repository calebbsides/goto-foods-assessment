import { createFirestoreDb } from "@/lib/db/providers/firestore-admin";
import type { Db } from "@/lib/db/types";

let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;
  cached = createFirestoreDb();
  return cached;
}
