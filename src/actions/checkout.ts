"use server";

import { redirect } from "next/navigation";
import { requireHost } from "@/lib/auth/require-host";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { checkoutSchema } from "@/lib/orders/schemas";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, type ActionResult } from "@/actions/result";

export async function checkout(formData: FormData): Promise<ActionResult<never> | void> {
  const host = await requireHost();
  const parsed = checkoutSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) {
    return fail("Invalid order.");
  }

  const { orderId } = parsed.data;

  try {
    await getDb().checkout({ orderId, hostUid: host.uid });
    reportEvent("order.checked_out", { orderId, hostUid: host.uid });
  } catch (error) {
    if (error instanceof DbError && error.code === "forbidden") {
      return fail("Only the host can check out.");
    }
    getLogger().error("action.checkout_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not check out. Please try again.");
  }

  redirect(`/orders/${orderId}/checkout`);
}
