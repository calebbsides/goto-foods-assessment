import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveOrder } from "@/app/orders/[orderId]/live-order";
import { getCallerParticipant } from "@/lib/auth/get-caller-participant";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCatalog } from "@/lib/catalog";
import { isFirebaseConfigured } from "@/lib/config";
import { getOrderSnapshot } from "@/lib/orders/get-order-snapshot";
import { SetupNotice } from "@/components/setup-notice";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Group order" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  if (!isFirebaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex-1 py-16">
          <div className="mx-auto max-w-md">
            <SetupNotice />
          </div>
        </main>
      </>
    );
  }

  const snapshot = await getOrderSnapshot(orderId);
  if (!snapshot) {
    notFound();
  }

  const [caller, user] = await Promise.all([
    getCallerParticipant(orderId),
    getCurrentUser(),
  ]);
  const role = caller?.role ?? "visitor";

  const cardsPromise = getCatalog().getFeatured();

  const roleCopy =
    role === "host"
      ? "You are the host. Invite people, set a timer, and check out when ready."
      : role === "guest"
        ? "Add cards to your cart. The host checks out for the group."
        : "You are viewing this order. Use your invite link to join and add cards.";

  return (
    <>
      <SiteHeader user={user} />
      <main className="container-page flex-1 py-8">
        <header className="mb-8 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {snapshot.order.hostName}&apos;s group order
            </h1>
            <Badge variant={role === "host" ? "default" : "secondary"} className="capitalize">
              {role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{roleCopy}</p>
        </header>

        <LiveOrder
          initial={snapshot}
          cardsPromise={cardsPromise}
          role={role}
          callerParticipantId={caller?.participantId ?? null}
        />
      </main>
    </>
  );
}
