"use server";

import { requireHost } from "@/lib/auth/require-host";
import { getDb } from "@/lib/db";
import { DbError } from "@/lib/db/types";
import { getEmail } from "@/lib/email";
import { buildJoinUrl } from "@/lib/orders/build-join-url";
import { inviteSchema } from "@/lib/orders/schemas";
import { createInviteToken, hashInviteToken } from "@/lib/token";
import { getLogger } from "@/lib/observability";
import { reportEvent } from "@/lib/observability/report-event";
import { fail, ok, type ActionResult } from "@/actions/result";

export interface InviteData {
  email: string;
  joinUrl: string;
  delivered: boolean;
  alreadyInvited: boolean;
}

export async function invite(formData: FormData): Promise<ActionResult<InviteData>> {
  const host = await requireHost();
  const parsed = inviteSchema.safeParse({
    orderId: formData.get("orderId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return fail("Enter a valid email address.");
  }

  const { orderId, email } = parsed.data;
  const token = createInviteToken();

  try {
    const result = await getDb().invite({
      orderId,
      hostUid: host.uid,
      email,
      tokenHash: hashInviteToken(token),
    });

    const joinUrl = await buildJoinUrl(token);

    if (result.alreadyInvited) {
      return ok({ email, joinUrl, delivered: false, alreadyInvited: true });
    }

    const sent = await getEmail().sendInvite({ to: email, hostName: host.name, joinUrl });
    reportEvent("order.invited", { orderId, delivered: sent.delivered });
    return ok({ email, joinUrl, delivered: sent.delivered, alreadyInvited: false });
  } catch (error) {
    if (error instanceof DbError && error.code === "cap_reached") {
      return fail("This group is full (3 participants max).");
    }
    if (error instanceof DbError && error.code === "order_closed") {
      return fail("This order is closed.");
    }
    if (error instanceof DbError && error.code === "forbidden") {
      return fail("Only the host can invite people.");
    }
    getLogger().error("action.invite_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return fail("Could not send the invite. Please try again.");
  }
}
