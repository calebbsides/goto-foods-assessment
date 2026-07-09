"use server";

import { requireHost } from "@/lib/auth/require-host";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { setTimerSchema } from "@/lib/orders/schemas";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, ok, type ActionResult } from "@/actions/result";

export async function setTimer(formData: FormData): Promise<ActionResult> {
  const host = await requireHost();
  const rawMinutes = formData.get("minutes");
  const parsed = setTimerSchema.safeParse({
    orderId: formData.get("orderId"),
    minutes: rawMinutes === null || rawMinutes === "" ? null : Number(rawMinutes),
  });
  if (!parsed.success) {
    return fail("Choose between 1 and 60 minutes.");
  }

  const { orderId, minutes } = parsed.data;
  const closesAt = minutes === null ? null : Date.now() + minutes * 60_000;

  try {
    await getDb().setTimer({ orderId, hostUid: host.uid, closesAt });
    reportEvent("order.timer_set", { orderId, minutes });
    return ok(undefined);
  } catch (error) {
    if (error instanceof DbError && error.code === "forbidden") {
      return fail("Only the host can set the timer.");
    }
    if (error instanceof DbError && error.code === "order_closed") {
      return fail("This order is already closed.");
    }
    getLogger().error("action.set_timer_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not update the timer. Please try again.");
  }
}
