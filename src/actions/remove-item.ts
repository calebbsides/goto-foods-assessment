"use server";

import { getCallerParticipant } from "@/lib/auth/get-caller-participant";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { removeItemSchema } from "@/lib/orders/schemas";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, ok, type ActionResult } from "@/actions/result";

export async function removeItem(formData: FormData): Promise<ActionResult> {
  const parsed = removeItemSchema.safeParse({
    orderId: formData.get("orderId"),
    lineId: formData.get("lineId"),
  });
  if (!parsed.success) {
    return fail("Invalid item.");
  }

  const { orderId, lineId } = parsed.data;

  const caller = await getCallerParticipant(orderId);
  if (!caller) {
    return fail("You are not part of this order.");
  }

  try {
    await getDb().removeItem({ orderId, participantId: caller.participantId, lineId });
    reportEvent("order.item_removed", { orderId, lineId });
    return ok(undefined);
  } catch (error) {
    if (error instanceof DbError && error.code === "order_closed") {
      return fail("This order is closed.");
    }
    getLogger().error("action.remove_item_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not remove the card. Please try again.");
  }
}
