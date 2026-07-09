import { getDb } from "@/lib/db";
import type { OrderSnapshot } from "@/lib/domain";

export function getOrderSnapshot(orderId: string): Promise<OrderSnapshot | null> {
  return getDb().getSnapshot(orderId);
}
