"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { guestCookieName, SESSION_MAX_AGE_MS } from "@/lib/auth/cookies";
import { joinSchema } from "@/lib/orders/schemas";
import { hashInviteToken } from "@/lib/token";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, type ActionResult } from "@/actions/result";

export async function join(formData: FormData): Promise<ActionResult<never> | void> {
  const parsed = joinSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return fail("Enter your name to join.");
  }

  const { token, name } = parsed.data;
  let orderId: string;

  try {
    const result = await getDb().join({
      tokenHash: hashInviteToken(token),
      name,
    });
    orderId = result.orderId;
    const store = await cookies();
    store.set(guestCookieName(orderId), result.participantId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });
    reportEvent("order.joined", { orderId, participantId: result.participantId });
  } catch (error) {
    if (error instanceof DbError && error.code === "order_closed") {
      return fail("This order is closed.");
    }
    if (error instanceof DbError && error.code === "invalid_invite") {
      return fail("This invite link is not valid.");
    }
    getLogger().error("action.join_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not join the order. Please try again.");
  }

  redirect(`/orders/${orderId}`);
}
