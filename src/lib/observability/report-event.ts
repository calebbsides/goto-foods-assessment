import { getLogger } from "@/lib/observability";

export type DomainEvent =
  | "order.created"
  | "order.invited"
  | "order.joined"
  | "order.item_added"
  | "order.item_removed"
  | "order.timer_set"
  | "order.closed"
  | "order.checked_out";

export function reportEvent(event: DomainEvent, context?: Record<string, unknown>): void {
  getLogger().info(event, { event, ...context });
}
