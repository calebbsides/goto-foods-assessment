import { getDb } from "@/lib/db";

export function findHostOpenOrder(hostUid: string): Promise<string | null> {
  return getDb().findOpenOrderByHost(hostUid);
}
