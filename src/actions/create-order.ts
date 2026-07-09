"use server";

import { redirect } from "next/navigation";
import { requireHost } from "@/lib/auth/require-host";
import { getDb } from "@/lib/db";
import { DEFAULT_TAX_RATE_BPS } from "@/lib/domain";
import { reportEvent } from "@/lib/observability/report-event";

export async function createOrder(): Promise<void> {
  const host = await requireHost();
  const orderId = await getDb().createOrder({
    hostUid: host.uid,
    hostName: host.name,
    hostEmail: host.email,
    taxRateBps: DEFAULT_TAX_RATE_BPS,
  });
  reportEvent("order.created", { orderId, hostUid: host.uid });
  redirect(`/orders/${orderId}`);
}
