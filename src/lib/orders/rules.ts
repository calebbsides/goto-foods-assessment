import { MAX_PARTICIPANTS, type Order } from "@/lib/domain";

export function canAddParticipant(currentCount: number): boolean {
  return currentCount < MAX_PARTICIPANTS;
}

export function isOrderClosed(order: Pick<Order, "status" | "closesAt">, now: number): boolean {
  if (order.status !== "open") return true;
  return order.closesAt !== null && now >= order.closesAt;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
